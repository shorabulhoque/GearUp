import { prisma } from "../../lib/prisma";

const createGearItemIntoDB = async (
    providerId: string,
    payload: { title: string; description: string; brand: string; pricePerDay: number; stock?: number; categoryId: string }
) => {
    const isCategoryExist = await prisma.category.findUnique({
        where: { id: payload.categoryId }
    });

    if (!isCategoryExist) {
        throw new Error("Target category does not exist!");
    }

    // নতুন গিয়ার আইটেম তৈরি
    const gearItem = await prisma.gearItem.create({
        data: {
            ...payload,
            providerId
        }
    });

    return gearItem;
};

export const gearService = {
    createGearItemIntoDB
};