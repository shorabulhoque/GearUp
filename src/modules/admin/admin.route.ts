import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);

router.patch("/users/:id/status", auth(UserRole.ADMIN), adminController.updateUserStatus);

router.get("/rentals", auth(UserRole.ADMIN), adminController.getAllRentalOrders);


export const adminRoutes = router;