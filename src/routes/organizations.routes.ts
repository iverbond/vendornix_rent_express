import { Router } from "express";
import * as organizationController from "../controllers/organization.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  createOrganizationValidator,
  deleteOrganizationValidator,
  getOrganizationValidator,
  updateOrganizationValidator,
} from "../validators/organization.validators";

const router = Router();

router.get("/", organizationController.listOrganizations);
router.get("/:id", validate(getOrganizationValidator), organizationController.getOrganization);
router.post("/", validate(createOrganizationValidator), organizationController.createOrganization);
router.put("/:id", validate(updateOrganizationValidator), organizationController.updateOrganization);
router.delete("/:id", validate(deleteOrganizationValidator), organizationController.deleteOrganization);

export default router;
