import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";


const getMe = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    const result = await userService.getMeFromDB(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile retrieved successfully",
        data: result
    });
});

export const userController = {
    getMe
};