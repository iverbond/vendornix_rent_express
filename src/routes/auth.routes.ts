import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { forgotPasswordValidator, resetPasswordValidator } from "../validators/auth.validators";

const router = Router();

router.post("/forgot-password", validate(forgotPasswordValidator), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordValidator), authController.resetPassword);

export default router;
