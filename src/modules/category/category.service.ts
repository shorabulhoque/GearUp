import { prisma } from "../../lib/prisma";

const createCategoryIntoDB = async (payload: { name: string; description?: string }) => {
    const { name, description } = payload;

    const isCategoryExist = await prisma.category.findUnique({
        where: { name }
    });

    if (isCategoryExist) {
        throw new Error("Category with this name already exists!");
    }

    const category = await prisma.category.create({
        data: {
            name,
            description
        }
    });

    return category;
};

export const categoryService = {
    createCategoryIntoDB
};