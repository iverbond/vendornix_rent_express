export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const buildPaginationMetadata = (
  page: number,
  limit: number,
  total: number,
): PaginationMetadata => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 0),
});
