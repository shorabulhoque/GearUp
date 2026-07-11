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

router.get(
    "/",
    gearController.getAllGearItems
);

router.get(
    "/:id",
    gearController.getSingleGearItem
);

router.patch(
    "/:id",
    auth(UserRole.PROVIDER),
    gearController.updateGearItem
);

router.delete(
    "/:id",
    auth(UserRole.PROVIDER),
    gearController.deleteGearItem
);


export const gearRoutes = router;