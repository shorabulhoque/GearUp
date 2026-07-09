import { Router } from "express";
import { orderController } from "./order.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router();

router.post(
    "/",
    auth(UserRole.CUSTOMER),
    orderController.createRentalOrder
);

router.get(
    "/my-rentals",
    auth(UserRole.CUSTOMER),
    orderController.getMyRentals
);

router.get(
    "/provider-orders",
    auth(UserRole.PROVIDER),
    orderController.getProviderOrders
);

router.patch(
    "/:id/status",
    auth(UserRole.PROVIDER),
    orderController.updateOrderStatus
);


export const orderRoutes = router;