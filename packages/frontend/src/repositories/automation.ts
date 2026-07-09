import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';

export interface AutomationData {
  summary: {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    avgDuration: number;
    failedToday: number;
  };
  workflows: {
    id: string;
    name: string;
    description: string;
    status: string;
    triggerLabel: string;
    actionLabels: string[];
    lastRun: string | null;
    runCount: number;
    successRate: number;
    avgDuration: number;
  }[];
  executions: {
    id: number;
    workflowId: string;
    workflowName: string;
    trigger: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    duration: number;
    actions: number;
    actionsCompleted: number;
    errorMessage: string | null;
    triggeredBy: string;
  }[];
  timeline: { timestamp: string; running: number; success: number; failed: number }[];
  activity: { id: string; type: string; message: string; timestamp: string; severity: string; workflowName: string }[];
  queue: { pending: number; running: number; completed: number; failed: number; throughput: number; avgWaitTime: number };
  scheduler: { type: string; cron: string; timezone: string; nextRun: string; lastRun: string };
  triggers: { type: string; label: string; description: string; enabled: boolean; config: string }[];
  actions: { type: string; label: string; description: string }[];
  retry: { enabled: boolean; maxRetries: number; backoffMultiplier: number; initialDelay: number; totalRetries: number; successRate: number };
  rollback: { enabled: boolean; strategies: string[]; rollbacksPerformed: number; rollbackSuccessRate: number; lastRollback: string | null };
  filterCategories: { id: string; label: string }[];
}

export const automationRepository = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<AutomationData>('/automation', { params: params as Record<string, string | number | boolean | undefined> }),
  triggerWorkflow: (id: string) =>
    apiClient.post(`/automation/workflows/${id}/trigger`),
};
