import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";


const router = Router();

router.get(
    "/me",
    auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
    userController.getMe
);


export const userRoutes = router;