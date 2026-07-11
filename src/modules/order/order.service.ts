import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";


const createRentalOrderIntoDB = async (
    customerId: string,
    payload: {
        startDate: string;
        endDate: string;
        items: { gearItemId: string; quantity: number }[];
    }
) => {
    const { startDate, endDate, items } = payload;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "End date must be after the start date!");
    };

    return await prisma.$transaction(async (tx) => {
        let totalPrice = 0;
        const orderItemsData = [];

        for (const item of items) {
            const gearItem = await tx.gearItem.findUnique({
                where: { id: item.gearItemId }
            });

            if (!gearItem) {
                throw new AppError(httpStatus.NOT_FOUND, `Gear item with ID ${item.gearItemId} not found!`);
            };

            if (gearItem.stock < item.quantity) {
                throw new AppError(httpStatus.BAD_REQUEST, `Inadequate stock for "${gearItem.title}". Available: ${gearItem.stock}`);
            };

            const itemPrice = gearItem.pricePerDay * totalDays * item.quantity;
            totalPrice += itemPrice;

            await tx.gearItem.update({
                where: { id: gearItem.id },
                data: {
                    stock: gearItem.stock - item.quantity,
                    isAvailable: gearItem.stock - item.quantity > 0
                }
            });

            orderItemsData.push({
                quantity: item.quantity,
                priceSnapshot: itemPrice,
                gearItem: {
                    connect: { id: item.gearItemId }
                }
            });
        };

        const newOrder = await tx.rentalOrder.create({
            data: {
                customerId,
                startDate: start,
                endDate: end,
                totalPrice,
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: true
            }
        });

        return newOrder;
    });
};

const getMyRentalsFromDB = async (customerId: string) => {
    const result = await prisma.rentalOrder.findMany({
        where: {
            customerId: customerId
        },
        include: {
            items: {
                include: {
                    gearItem: {
                        select: {
                            title: true,
                            brand: true,
                            pricePerDay: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return result;
};

const getProviderOrdersFromDB = async (providerId: string) => {

    const result = await prisma.rentalOrder.findMany({
        where: {
            items: {
                some: {
                    gearItem: {
                        providerId: providerId
                    }
                }
            }
        },
        include: {
            customer: {
                select: { name: true, email: true }
            },
            items: {
                include: {
                    gearItem: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return result;
};

const updateOrderStatusInDB = async (orderId: string, status: any) => {
    const result = await prisma.rentalOrder.update({
        where: { id: orderId },
        data: { status },
        include: { items: true }
    });

    return result;
};

const getOrderDetailsFromDB = async (orderId: string, userId: string, userRole: string) => {
    const order = await prisma.rentalOrder.findUnique({
        where: { id: orderId },
        include: {
            customer: { select: { name: true, email: true } },
            items: { include: { gearItem: true } }
        }
    });

    if (!order) throw new AppError(httpStatus.NOT_FOUND, "Rental order not found!");

    if (userRole === "CUSTOMER" && order.customerId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "Unauthorized to view this order!");
    };

    if (userRole === "PROVIDER") {
        const hasProviderItem = order.items.some(item => item.gearItem.providerId === userId);
        if (!hasProviderItem) {
            throw new AppError(httpStatus.FORBIDDEN, "Unauthorized! This order does not contain your gear.");
        };
    };

    return order;
};


export const orderService = {
    createRentalOrderIntoDB,
    getMyRentalsFromDB,
    getProviderOrdersFromDB,
    updateOrderStatusInDB,
    getOrderDetailsFromDB
};