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

export const gearService = {
    createGearItemIntoDB,
    getAllGearItemsFromDB
};