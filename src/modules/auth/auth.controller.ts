import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
import httpStatus from "http-status";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const user = await authService.registerUserIntoDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: {
            user
        },
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await authService.loginUser(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User validated successfully (Testing Phase)",
        data: result
    });
});

export const authController = {
    registerUser,
    loginUser,
};