import { prisma } from "../../lib/prisma";

const createReviewIntoDB = async (customerId: string, payload: { gearItemId: string; rating: number; comment: string }) => {
    const { gearItemId, rating, comment } = payload;

    const hasRented = await prisma.rentalOrder.findFirst({
        where: {
            customerId,
            items: {
                some: {
                    gearItemId
                }
            }
        }
    });

    if (!hasRented) {
        throw new Error("You can only review gear items that you have actually rented!");
    }

    const result = await prisma.review.create({
        data: {
            customerId,
            gearItemId,
            rating,
            comment
        }
    });

    return result;
};

export const reviewService = {
    createReviewIntoDB
};