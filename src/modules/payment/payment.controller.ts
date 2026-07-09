import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";


const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
    const { rentalOrderId } = req.body;
    const customerId = req.user?.id as string;

    const result = await paymentService.createPaymentSessionInDB(rentalOrderId, customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Stripe hosted checkout session created successfully",
        data: result
    });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
    const { transactionId, status } = req.body;

    const result = await paymentService.confirmPaymentInDB(transactionId, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment confirmed and updated successfully",
        data: result
    });
});

const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;

    const result = await paymentService.getPaymentHistoryFromDB(customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history retrieved successfully",
        data: result
    });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;

    await paymentService.handleStripeWebhookInDB(payload, signature);

    res.status(httpStatus.OK).json({ received: true });
});


export const paymentController = {
    createPaymentSession,
    confirmPayment,
    getPaymentHistory,
    handleStripeWebhook
};