import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';
export interface AuditRecord {
  id: string; user: string; action: string; resource: string; resourceId: string;
  ip: string; location: string; device: string; browser: string;
  sessionId: string; correlationId: string; timestamp: string;
  status: 'success' | 'failed'; details: string;
}
export interface AuditResponse {
  summary: { totalEvents: number; successEvents: number; failedEvents: number; uniqueUsers: number; uniqueActions: number; uniqueResources: number };
  records: AuditRecord[];
  timeline: { timestamp: string; success: number; failed: number }[];
  filterActions: { id: string; label: string }[];
  filterResources: { id: string; label: string }[];
  filterUsers: { id: string; label: string }[];
}
export const auditRepository = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<AuditResponse>('/audit', { params: params as Record<string, string | number | boolean | undefined> }),
};
