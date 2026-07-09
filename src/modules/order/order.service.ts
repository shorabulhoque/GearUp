import { connect } from "node:http2";
import { prisma } from "../../lib/prisma";


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
        throw new Error("End date must be after the start date!");
    }

    return await prisma.$transaction(async (tx) => {
        let totalPrice = 0;
        const orderItemsData = [];

        for (const item of items) {
            const gearItem = await tx.gearItem.findUnique({
                where: { id: item.gearItemId }
            });

            if (!gearItem) {
                throw new Error(`Gear item with ID ${item.gearItemId} not found!`);
            };

            if (gearItem.stock < item.quantity) {
                throw new Error(`Inadequate stock for "${gearItem.title}". Available: ${gearItem.stock}`);
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

export const orderService = {
    createRentalOrderIntoDB
};