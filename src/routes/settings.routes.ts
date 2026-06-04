import { Router } from "express";
import * as appSettingsController from "../controllers/app-settings.controller";
import { validate } from "../middlewares/validation.middleware";
import { updateAppSettingsValidator } from "../validators/app-settings.validators";

const router = Router();

router.get("/", appSettingsController.getAppSettings);
router.put("/", validate(updateAppSettingsValidator), appSettingsController.updateAppSettings);

export default router;
