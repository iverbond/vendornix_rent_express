import { Router } from "express";
import * as clientController from "../controllers/client.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  createClientValidator,
  deleteClientValidator,
  getClientValidator,
  listClientsValidator,
  updateClientValidator,
} from "../validators/client.validators";

const router = Router();

router.get("/", validate(listClientsValidator), clientController.listClients);
router.get("/:id", validate(getClientValidator), clientController.getClient);
router.post("/", validate(createClientValidator), clientController.createClient);
router.put("/:id", validate(updateClientValidator), clientController.updateClient);
router.delete("/:id", validate(deleteClientValidator), clientController.deleteClient);

export default router;
