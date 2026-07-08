import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { gearService } from "./gear.service";

const createGearItem = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.id as string;
    const payload = req.body;

    const result = await gearService.createGearItemIntoDB(providerId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Gear item added successfully to your inventory",
        data: result
    });
});

export const gearController = {
    createGearItem
};