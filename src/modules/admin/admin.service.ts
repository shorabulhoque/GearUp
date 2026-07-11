import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const getAllUsersFromDB = async () => {

    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        },
        orderBy: { createdAt: "desc" }
    });
};

const updateUserStatusInDB = async (userId: string, status: UserStatus) => {

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found!");

    return await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: { id: true, name: true, email: true, status: true }
    });
};

const getAllRentalOrdersFromDB = async () => {

    return await prisma.rentalOrder.findMany({
        include: {
            customer: { select: { name: true, email: true } },
            payments: true
        },
        orderBy: { createdAt: "desc" }
    });
};

const getAllGearFromDB = async () => {
    return await prisma.gearItem.findMany({
        include: {
            category: true,
            provider: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
    });
};


export const adminService = {
    getAllUsersFromDB,
    updateUserStatusInDB,
    getAllRentalOrdersFromDB,
    getAllGearFromDB
};