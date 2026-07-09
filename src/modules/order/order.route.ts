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


export const orderRoutes = router;