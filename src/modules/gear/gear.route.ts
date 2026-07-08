import { Router } from "express";
import { gearController } from "./gear.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router();

router.post(
    "/",
    auth(UserRole.PROVIDER),
    gearController.createGearItem
);

router.get("/", gearController.getAllGearItems);


export const gearRoutes = router;