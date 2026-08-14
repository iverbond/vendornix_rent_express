import { Router } from "express";
import * as clientController from "../controllers/client.controller";
import { MembershipRole } from "../constants/enums";
import { requireMinRole, requireOrganization } from "../middlewares/organization-context.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createClientValidator,
  deleteClientValidator,
  getClientValidator,
  listClientsValidator,
  updateClientValidator,
} from "../validators/client.validators";

const router = Router();

router.use(requireOrganization);

router.get("/", validate(listClientsValidator), clientController.listClients);
router.get("/:id", validate(getClientValidator), clientController.getClient);
router.post(
  "/",
  requireMinRole(MembershipRole.AGENT),
  validate(createClientValidator),
  clientController.createClient,
);
router.put(
  "/:id",
  requireMinRole(MembershipRole.AGENT),
  validate(updateClientValidator),
  clientController.updateClient,
);
router.delete(
  "/:id",
  requireMinRole(MembershipRole.MANAGER),
  validate(deleteClientValidator),
  clientController.deleteClient,
);

export default router;
