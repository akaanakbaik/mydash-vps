export interface ApiResponse<T> {
  success: true;
  data: T;
  correlationId: string;
  timestamp: string;
}
export interface ApiErrorBody {
  code: string;
  message: string;
  details: Record<string, string[]> | null;
}
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  correlationId: string;
  timestamp: string;
}
export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginatedMeta;
  correlationId: string;
  timestamp: string;
}
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
export interface RequestConfig {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: string;
}
