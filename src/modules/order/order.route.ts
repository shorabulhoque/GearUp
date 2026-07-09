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


export const orderRoutes = router;