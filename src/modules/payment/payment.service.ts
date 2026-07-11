import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";


const stripe = new Stripe(config.stripe_secret_key);

const createPaymentSessionInDB = async (rentalOrderId: string, customerId: string) => {
    const order = await prisma.rentalOrder.findUnique({
        where: { id: rentalOrderId },
        include: {
            customer: true
        }
    });

    if (!order) throw new AppError(httpStatus.NOT_FOUND, "Rental order not found!");
    if (order.customerId !== customerId) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized to pay for this order!");
    if (!order.customer?.email) throw new AppError(httpStatus.BAD_REQUEST, "Customer email not found!");

    const session = await stripe.checkout.sessions.create({
        customer_email: order.customer.email,

        line_items: [
            {
                price_data: {
                    currency: "chf",
                    product_data: {
                        name: `Gear Rental Order #${order.id.slice(0, 8)}`,
                        description: "Payment for your rental gear order",
                    },
                    unit_amount: Math.round(order.totalPrice * 100),
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        payment_method_types: ["card"],
        success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.app_url}/payment/cancel`,
        metadata: {
            rentalOrderId,
            customerId
        }
    });

    const payment = await prisma.payment.create({
        data: {
            transactionId: session.id,
            amount: order.totalPrice,
            gateway: "STRIPE",
            status: "PENDING",
            rentalOrderId
        }
    });

    return {
        payment,
        paymentUrl: session.url
    };
};

const confirmPaymentInDB = async (transactionId: string, status: "COMPLETED" | "FAILED") => {
    return await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
            where: { transactionId },
            data: {
                status: status === "COMPLETED" ? "COMPLETED" : "FAILED",
                paidAt: status === "COMPLETED" ? new Date() : null
            }
        });

        if (status === "COMPLETED") {
            await tx.rentalOrder.update({
                where: { id: updatedPayment.rentalOrderId },
                data: { status: "PAID" }
            });
        }

        return updatedPayment;
    });
};

const getPaymentHistoryFromDB = async (customerId: string) => {
    return await prisma.payment.findMany({
        where: {
            rentalOrder: { customerId }
        },
        include: { rentalOrder: true },
        orderBy: { createdAt: "desc" }
    });
};

const handleStripeWebhookInDB = async (payload: Buffer, signature: string) => {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            config.stripe_webhook_secret
        );
    } catch (error: any) {
        console.error(`Webhook Signature Verification Failed:`, error.message);
        throw new AppError(httpStatus.BAD_REQUEST, `Webhook Error: ${error.message}`);
    };

    console.log(`Stripe Webhook Received Event Type: ${event.type}`);
    console.log(`Stripe Webhook Received Event Data: ${event.data}`);

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            const transactionId = session.id;
            const rentalOrderId = session.metadata?.rentalOrderId;

            if (session.payment_status === "paid") {
                await prisma.$transaction(async (tx) => {
                    await tx.payment.update({
                        where: { transactionId },
                        data: {
                            status: "COMPLETED",
                            paidAt: new Date()
                        }
                    });

                    if (rentalOrderId) {
                        await tx.rentalOrder.update({
                            where: { id: rentalOrderId },
                            data: { status: "PAID" }
                        });
                    }
                });
                console.log(`Payment and Order successfully updated for Session: ${transactionId}`);
            }
            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            const transactionId = session.id;

            await prisma.payment.update({
                where: { transactionId },
                data: { status: "FAILED" }
            });
            console.log(`Stripe Checkout Session Expired: ${transactionId}`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
};

const getPaymentDetailsFromDB = async (paymentId: string, userId: string, userRole: string) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { rentalOrder: true }
    });

    if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment record not found!");

    if (userRole === "CUSTOMER" && payment.rentalOrder.customerId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "Unauthorized to view this payment details!");
    };

    return payment;
};


export const paymentService = {
    createPaymentSessionInDB,
    confirmPaymentInDB,
    getPaymentHistoryFromDB,
    handleStripeWebhookInDB,
    getPaymentDetailsFromDB
};