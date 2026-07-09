import type { ErrorCode } from '../constants/errorCodes.js';

export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  data: T | null;
  message: string;
  timestamp: string;
  requestId: string;
  correlationId: string;
  metadata: ApiMetadata | null;
}

export interface ApiMetadata {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  success: false;
  data: null;
  message: string;
  code: ErrorCode;
  severity: string;
  category: string;
  timestamp: string;
  requestId: string;
  correlationId: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}
