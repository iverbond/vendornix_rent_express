import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  createUserValidator,
  deleteUserValidator,
  getUserValidator,
  updateUserValidator,
} from "../validators/user.validators";

const router = Router();

router.get("/", userController.listUsers);
router.get("/:id", validate(getUserValidator), userController.getUser);
router.post("/", validate(createUserValidator), userController.createUser);
router.put("/:id", validate(updateUserValidator), userController.updateUser);
router.delete("/:id", validate(deleteUserValidator), userController.deleteUser);

export default router;
