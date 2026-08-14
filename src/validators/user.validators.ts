import { body, param, query } from "express-validator";
import { UserRole, UserStatus } from "../constants/enums";
import { uuidParam } from "./common.validators";

export const listUsersValidator = [] as const;

export const getUserValidator = [uuidParam("id")] as const;

export const searchUsersValidator = [query("email").trim().isEmail().withMessage("Adresse e-mail invalide.")] as const;

export const resetUserPasswordValidator = [uuidParam("id")] as const;

export const createUserValidator = [
  body("firstName").trim().notEmpty().isLength({ max: 120 }),
  body("lastName").trim().notEmpty().isLength({ max: 120 }),
  body("email").trim().isEmail().normalizeEmail(),
  body("phone").optional({ nullable: true }).isString().isLength({ max: 40 }),
  body("password").isString().isLength({ min: 8, max: 128 }),
  body("status").optional().isIn(Object.values(UserStatus)),
  body("role").optional().isIn(Object.values(UserRole)),
] as const;

export const updateUserValidator = [
  uuidParam("id"),
  body("firstName").optional().trim().notEmpty().isLength({ max: 120 }),
  body("lastName").optional().trim().notEmpty().isLength({ max: 120 }),
  body("phone").optional({ nullable: true }).isString().isLength({ max: 40 }),
  body("password").optional().isString().isLength({ min: 8, max: 128 }),
  body("status").optional().isIn(Object.values(UserStatus)),
  body("role").optional().isIn(Object.values(UserRole)),
] as const;

export const deleteUserValidator = [uuidParam("id")] as const;
