import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { orderService } from "./order.service";


const createRentalOrder = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;
    const payload = req.body;

    const result = await orderService.createRentalOrderIntoDB(customerId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental order placed successfully",
        data: result
    });
});


export const orderController = {
    createRentalOrder
};