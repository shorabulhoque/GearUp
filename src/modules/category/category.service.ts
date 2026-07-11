import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";

const createCategoryIntoDB = async (payload: { name: string; description?: string }) => {
    const { name, description } = payload;

    const isCategoryExist = await prisma.category.findUnique({
        where: { name }
    });

    if (isCategoryExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Category with this name already exists!");
    }

    const category = await prisma.category.create({
        data: {
            name,
            description
        }
    });

    return category;
};

const getAllCategoriesFromDB = async () => {
    const result = await prisma.category.findMany({
        orderBy: {
            name: "asc"
        }
    });
    return result;
};


export const categoryService = {
    createCategoryIntoDB,
    getAllCategoriesFromDB
};