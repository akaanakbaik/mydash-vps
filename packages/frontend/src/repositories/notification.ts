import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';

export interface NotificationSummary {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  successRate: number;
  rateLimited: number;
}

export interface NotificationHistoryRowData {
  id: number;
  timestamp: string;
  title: string;
  message: string;
  provider: string;
  status: string;
  category: string;
  severity: string;
  retryCount: number;
  latency: number;
}

export interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  provider: string;
  enabled: boolean;
  priority: string;
  lastTriggered: string | null;
  triggerCount: number;
}

export interface NotificationProvider {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  status: string;
  latency: number;
  lastUsed: string;
}

export interface NotificationResponse {
  summary: NotificationSummary;
  rules: NotificationRule[];
  providers: NotificationProvider[];
  history: NotificationHistoryRowData[];
  queue: { pending: number; processing: number; throughput: number; avgWaitTime: number; maxQueueSize: number; backpressure: boolean };
  retry: { activeRetries: number; maxRetries: number; successRate: number; avgRetryDelay: number; nextRetryBatch: string; deadLetterCount: number };
  rateLimit: { currentRate: number; limit: number; remaining: number; resetAt: string; throttled: number };
  deduplication: { enabled: boolean; window: number; deduplicated: number; recentHashes: number };
  deliveryStats: { period: string; total: number; success: number; failed: number; avgLatency: number; p95Latency: number }[];
  templates: { id: string; name: string; provider: string; preview: string; lastUsed: string; useCount: number }[];
  timeline: { timestamp: string; sent: number; delivered: number; failed: number }[];
  activity: { id: string; type: string; message: string; timestamp: string; severity: string; provider: string }[];
  filterCategories: { id: string; label: string }[];
}

export const notificationRepository = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<NotificationResponse>('/notifications', { params: params as Record<string, string | number | boolean | undefined> }),
  getRules: () =>
    apiClient.get<NotificationRule[]>('/notifications/rules'),
  getProviders: () =>
    apiClient.get<NotificationProvider[]>('/notifications/providers'),
};
