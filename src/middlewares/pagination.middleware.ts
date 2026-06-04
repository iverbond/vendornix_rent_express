import { NextFunction, Request, Response } from "express";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const paginationMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const page = Math.max(Number(req.query.page ?? DEFAULT_PAGE), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);
  const offset = (page - 1) * limit;

  req.pagination = { page, limit, offset };
  req.filters = {
    keyword: typeof req.query.keyword === "string" ? req.query.keyword : undefined,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    type: typeof req.query.type === "string" ? req.query.type : undefined,
    categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
    assetId: typeof req.query.assetId === "string" ? req.query.assetId : undefined,
    clientId: typeof req.query.clientId === "string" ? req.query.clientId : undefined,
    dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
    sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt",
    sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
  };

  next();
};
