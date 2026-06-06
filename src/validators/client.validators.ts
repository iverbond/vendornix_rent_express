import { body, param, query } from "express-validator";
import { uuidParam } from "./common.validators";

export const listClientsValidator = [
  query("organizationId").optional().isUUID(4),
] as const;

export const getClientValidator = [uuidParam("id")] as const;

export const createClientValidator = [
  body("organizationId").isUUID(4),
  body("firstName").trim().notEmpty().isLength({ max: 120 }),
  body("lastName").trim().notEmpty().isLength({ max: 120 }),
  body("email").optional({ nullable: true }).isEmail(),
  body("phone").optional({ nullable: true }).isString().trim().isLength({ max: 40 }),
  body("nationalId").optional({ nullable: true }).isString().trim().isLength({ max: 80 }),
  body("address").optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
] as const;

export const updateClientValidator = [
  uuidParam("id"),
  body("firstName").optional().trim().notEmpty().isLength({ max: 120 }),
  body("lastName").optional().trim().notEmpty().isLength({ max: 120 }),
  body("email").optional({ nullable: true }).isEmail(),
  body("phone").optional({ nullable: true }).isString().trim().isLength({ max: 40 }),
  body("nationalId").optional({ nullable: true }).isString().trim().isLength({ max: 80 }),
  body("address").optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
] as const;

export const deleteClientValidator = [uuidParam("id")] as const;
