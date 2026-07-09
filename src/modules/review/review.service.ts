import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";


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
        throw new AppError(httpStatus.FORBIDDEN, "You can only review gear items that you have actually rented!");
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