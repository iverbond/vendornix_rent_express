import { body, param } from "express-validator";
import { OrganizationStatus, OrganizationType } from "../constants/enums";
import { uuidParam } from "./common.validators";

export const getOrganizationValidator = [uuidParam("id")] as const;

export const createOrganizationValidator = [
  body("name").trim().notEmpty().isLength({ max: 255 }),
  body("type").isIn(Object.values(OrganizationType)),
  body("status").optional().isIn(Object.values(OrganizationStatus)),
] as const;

export const updateOrganizationValidator = [
  uuidParam("id"),
  body("name").optional().trim().notEmpty().isLength({ max: 255 }),
  body("type").optional().isIn(Object.values(OrganizationType)),
  body("status").optional().isIn(Object.values(OrganizationStatus)),
] as const;

export const deleteOrganizationValidator = [uuidParam("id")] as const;
