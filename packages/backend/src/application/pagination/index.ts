export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  fields: Record<string, unknown>;
}

export interface QueryParams extends PaginationParams, SortParams {
  filters?: FilterParams;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function createPaginationParams(query: Partial<PaginationParams>): PaginationParams {
  return {
    page: Math.max(1, query.page ?? 1),
    pageSize: Math.min(100, Math.max(1, query.pageSize ?? 20)),
  };
}

export function createPaginatedResult<T>(items: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  };
}
