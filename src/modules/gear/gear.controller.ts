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

const getSingleGearItem = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await gearService.getSingleGearItemFromDB(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item details retrieved successfully",
        data: result
    });
});

const updateGearItem = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const providerId = req.user?.id as string;
    const payload = req.body;

    const result = await gearService.updateGearItemInDB(id, providerId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item updated successfully",
        data: result
    });
});

const deleteGearItem = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const providerId = req.user?.id as string;

    const result = await gearService.deleteGearItemFromDB(id, providerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item deleted successfully from your inventory",
        data: result
    });
});


export const gearController = {
    createGearItem,
    getAllGearItems,
    getSingleGearItem,
    updateGearItem,
    deleteGearItem
};