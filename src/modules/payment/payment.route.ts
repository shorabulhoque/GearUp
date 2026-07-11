import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router();

router.post("/create", auth(UserRole.CUSTOMER), paymentController.createPaymentSession);

router.post("/confirm", paymentController.confirmPayment);

router.get("/", auth(UserRole.CUSTOMER), paymentController.getPaymentHistory);

router.post("/webhook", paymentController.handleStripeWebhook);

router.get("/:id", auth(UserRole.CUSTOMER, UserRole.ADMIN), paymentController.getPaymentDetails);


export const paymentRoutes = router;