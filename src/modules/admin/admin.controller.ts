import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";


const getAllUsers = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.getAllUsersFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All users retrieved successfully for admin",
        data: result
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {

    const id = req.params.id as string;
    const status = req.body.status as UserStatus;

    if (status !== "ACTIVE" && status !== "SUSPENDED") {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid status! Status must be either ACTIVE or SUSPENDED.");
    };

    const result = await adminService.updateUserStatusInDB(id, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `User status updated to ${status} successfully`,
        data: result
    });
});

const getAllRentalOrders = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.getAllRentalOrdersFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All rental orders retrieved successfully for admin",
        data: result
    });
});

const getAllGearForAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAllGearFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All gear listings retrieved successfully for admin",
        data: result
    });
});


export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllRentalOrders,
    getAllGearForAdmin
};