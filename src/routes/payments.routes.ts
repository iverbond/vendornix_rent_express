import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { requireOrganization } from "../middlewares/organization-context.middleware";

const router = Router();

router.use(requireOrganization);

router.get("/reminders", paymentController.listPaymentReminders);

export default router;
