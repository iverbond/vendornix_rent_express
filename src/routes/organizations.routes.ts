import { Router } from "express";
import * as organizationController from "../controllers/organization.controller";
import { UserRole } from "../constants/enums";
import { requirePlatformRole } from "../middlewares/platform-role.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createOrganizationValidator,
  deleteOrganizationValidator,
  getOrganizationValidator,
  updateOrganizationValidator,
} from "../validators/organization.validators";

const router = Router();

// Platform administration screen — the personal organization created at registration
// doesn't go through these routes and is unaffected.
router.use(requirePlatformRole(UserRole.ADMIN));

router.get("/", organizationController.listOrganizations);
router.get("/:id", validate(getOrganizationValidator), organizationController.getOrganization);
router.post("/", validate(createOrganizationValidator), organizationController.createOrganization);
router.put("/:id", validate(updateOrganizationValidator), organizationController.updateOrganization);
router.delete("/:id", validate(deleteOrganizationValidator), organizationController.deleteOrganization);

export default router;
