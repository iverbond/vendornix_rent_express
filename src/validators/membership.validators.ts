import { body, param } from "express-validator";
import { MembershipRole } from "../constants/enums";
import { uuidParam } from "./common.validators";

export const createMembershipValidator = [
  body("userId").isUUID(4),
  body("organizationId").isUUID(4),
  body("role").isIn(Object.values(MembershipRole)),
] as const;

export const deleteMembershipValidator = [uuidParam("id")] as const;
