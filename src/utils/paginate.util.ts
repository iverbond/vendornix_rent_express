import type { PaginatedResult } from "../interfaces/api-response.interface";
import type { ListQueryOptions } from "../types/query.types";
import { buildPaginationMetadata } from "./pagination.util";

export const toPaginatedResult = <T>(
  items: T[],
  options: ListQueryOptions,
  total: number,
): PaginatedResult<T> => ({
  items,
  pagination: buildPaginationMetadata(options.page, options.limit, total),
});
