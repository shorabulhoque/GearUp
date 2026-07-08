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

const getAllGearItems = catchAsync(async (req: Request, res: Response) => {
    const filters = req.query;

    const result = await gearService.getAllGearItemsFromDB(filters);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear items retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});


export const gearController = {
    createGearItem,
    getAllGearItems
};