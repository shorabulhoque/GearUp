import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";


const createGearItemIntoDB = async (
    providerId: string,
    payload: { title: string; description: string; brand: string; pricePerDay: number; stock?: number; categoryId: string }
) => {
    const isCategoryExist = await prisma.category.findUnique({
        where: { id: payload.categoryId }
    });

    if (!isCategoryExist) {
        throw new AppError(httpStatus.CONFLICT, "Target category does not exist!");
    }

    const gearItem = await prisma.gearItem.create({
        data: {
            ...payload,
            providerId
        }
    });

    return gearItem;
};

const getAllGearItemsFromDB = async (query: Record<string, any>) => {
    const { searchTerm, categoryId, minPrice, maxPrice, page = 1, limit = 10 } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const andConditions: any[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: "insensitive" } },
                { brand: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } }
            ]
        });
    };

    if (categoryId) {
        andConditions.push({ categoryId });
    };

    if (minPrice || maxPrice) {
        const priceCondition: any = {};
        if (minPrice) priceCondition.gte = parseFloat(minPrice);
        if (maxPrice) priceCondition.lte = parseFloat(maxPrice);
        andConditions.push({ pricePerDay: priceCondition });
    };

    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.gearItem.findMany({
        where: whereConditions,
        skip,
        take,
        include: {
            category: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const total = await prisma.gearItem.count({ where: whereConditions });

    return {
        meta: {
            page: Number(page),
            limit: take,
            total
        },
        data: result
    };
};

const getSingleGearItemFromDB = async (id: string) => {
    const gearItem = await prisma.gearItem.findUnique({
        where: { id },
        include: {
            category: true
        }
    });

    if (!gearItem) {
        throw new AppError(httpStatus.NOT_FOUND, "Gear item not found!");
    };

    return gearItem;
};

const updateGearItemInDB = async (
    id: string,
    providerId: string,
    payload: Partial<{ title: string; description: string; brand: string; pricePerDay: number; stock: number; categoryId: string }>
) => {
    const gearItem = await prisma.gearItem.findUnique({
        where: { id }
    });

    if (!gearItem) {
        throw new AppError(httpStatus.NOT_FOUND, "Gear item not found!");
    };

    if (gearItem.providerId !== providerId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this gear item!");
    };

    if (payload.categoryId) {
        const isCategoryExist = await prisma.category.findUnique({
            where: { id: payload.categoryId }
        });
        if (!isCategoryExist) {
            throw new AppError(httpStatus.CONFLICT, "Target category does not exist!");
        };
    };

    const updateData = { ...payload } as any;
    if (payload.stock !== undefined) {
        updateData.isAvailable = payload.stock > 0;
    };

    const result = await prisma.gearItem.update({
        where: { id },
        data: updateData,
        include: {
            category: true
        }
    });

    return result;
};

const deleteGearItemFromDB = async (id: string, providerId: string) => {
    const gearItem = await prisma.gearItem.findUnique({
        where: { id }
    });

    if (!gearItem) {
        throw new AppError(httpStatus.NOT_FOUND, "Gear item not found!");
    };

    if (gearItem.providerId !== providerId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this gear item!");
    };

    const result = await prisma.gearItem.delete({
        where: { id }
    });

    return result;
};


export const gearService = {
    createGearItemIntoDB,
    getAllGearItemsFromDB,
    getSingleGearItemFromDB,
    updateGearItemInDB,
    deleteGearItemFromDB
};