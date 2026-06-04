import { Op, WhereOptions } from "sequelize";
import type { ListQueryOptions, RequestFilters } from "../types/query.types";

export const buildKeywordWhere = (
  keyword: string | undefined,
  fields: string[],
): WhereOptions | undefined => {
  if (!keyword?.trim()) return undefined;
  const term = `%${keyword.trim()}%`;
  return {
    [Op.or]: fields.map((field) => ({ [field]: { [Op.like]: term } })),
  };
};

export const mergeWhere = (...conditions: Array<WhereOptions | undefined>): WhereOptions => {
  const valid = conditions.filter((c): c is WhereOptions => Boolean(c));
  if (valid.length === 0) return {};
  if (valid.length === 1) return valid[0] as WhereOptions;
  return { [Op.and]: valid };
};

export const listOptionsFromRequest = (
  pagination: { page: number; limit: number; offset: number },
  filters: RequestFilters = {},
): ListQueryOptions => ({
  page: pagination.page,
  limit: pagination.limit,
  offset: pagination.offset,
  keyword: filters.keyword,
  status: filters.status,
  type: filters.type,
  categoryId: filters.categoryId,
  assetId: filters.assetId,
  clientId: filters.clientId,
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
  sortBy: filters.sortBy,
  sortOrder: filters.sortOrder,
});
