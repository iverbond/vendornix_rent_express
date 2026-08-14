import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { UserRole } from "../constants/enums";
import { requirePlatformRole } from "../middlewares/platform-role.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createUserValidator,
  deleteUserValidator,
  getUserValidator,
  resetUserPasswordValidator,
  searchUsersValidator,
  updateUserValidator,
} from "../validators/user.validators";

const router = Router();

// Declared before `/:id` so it isn't swallowed by the param route.
router.get("/search", validate(searchUsersValidator), userController.searchUsers);

router.get("/", requirePlatformRole(UserRole.ADMIN), userController.listUsers);
// Self-or-admin check lives in the controller — this endpoint also backs `getCurrentUser()` for every user.
router.get("/:id", validate(getUserValidator), userController.getUser);
router.post("/", requirePlatformRole(UserRole.ADMIN), validate(createUserValidator), userController.createUser);
router.put(
  "/:id",
  requirePlatformRole(UserRole.ADMIN),
  validate(updateUserValidator),
  userController.updateUser,
);
router.post(
  "/:id/reset-password",
  requirePlatformRole(UserRole.ADMIN),
  validate(resetUserPasswordValidator),
  userController.resetUserPassword,
);
router.delete(
  "/:id",
  requirePlatformRole(UserRole.ADMIN),
  validate(deleteUserValidator),
  userController.deleteUser,
);

export default router;
