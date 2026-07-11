export type { WorkspaceCreateDTO, ServerCreateDTO, LoginRequestDTO, MetricIngestDTO, NotificationRuleCreateDTO, AutomationCreateDTO } from './domain.js';
export interface PaginatedDTO<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface BaseResponseDTO {
  correlationId: string;
  timestamp: string;
}
export interface ErrorResponseDTO {
  code: string;
  message: string;
  details: Record<string, unknown> | null;
  correlationId: string;
  timestamp: string;
}
