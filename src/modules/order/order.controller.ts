import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { orderService } from "./order.service";
import { OrderStatus } from "../../../generated/prisma/enums";

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

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id as string;

    const result = await orderService.getMyRentalsFromDB(customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My rental orders retrieved successfully",
        data: result
    });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.id as string;

    const result = await orderService.getProviderOrdersFromDB(providerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Provider orders retrieved successfully",
        data: result
    });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const status = req.body.status as OrderStatus;

    const validStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status! Valid statuses are: ${validStatuses.join(", ")}`);
    }

    const result = await orderService.updateOrderStatusInDB(id, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Order status updated successfully",
        data: result
    });
});


export const orderController = {
    createRentalOrder,
    getMyRentals,
    getProviderOrders,
    updateOrderStatus
};