export interface RequestFilters {
  keyword?: string;
  status?: string;
  type?: string;
  categoryId?: string;
  assetId?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListQueryOptions extends RequestFilters {
  page: number;
  limit: number;
  offset: number;
}
