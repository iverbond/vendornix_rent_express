import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  forgotPasswordValidator,
  loginValidator,
  refreshValidator,
  registerValidator,
  resetPasswordValidator,
} from "../validators/auth.validators";

const router = Router();

router.post("/login", validate(loginValidator), authController.login);
router.post("/register", validate(registerValidator), authController.register);
router.post("/refresh", validate(refreshValidator), authController.refresh);
router.post("/forgot-password", validate(forgotPasswordValidator), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordValidator), authController.resetPassword);

export default router;
