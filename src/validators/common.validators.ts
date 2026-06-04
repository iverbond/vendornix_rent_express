import { param, query } from "express-validator";

export const uuidParam = (name = "id") => param(name).isUUID().withMessage(`${name} must be a valid UUID`);

export const paginationQuery = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("keyword").optional().isString().trim(),
  query("status").optional().isString().trim(),
  query("sortBy").optional().isString().trim(),
  query("sortOrder").optional().isIn(["asc", "desc"]),
];
