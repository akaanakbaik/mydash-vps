export interface WorkspaceCreateDTO {
  name: string;
  displayName: string;
  timezone: string;
  language: string;
}
export interface ServerCreateDTO {
  displayName: string;
  hostname: string;
  timezone: string;
  workspaceId: string;
}
export interface LoginRequestDTO {
  workspaceId: string;
  password: string;
}
export interface MetricIngestDTO {
  serverId: string;
  metricType: string;
  data: Record<string, unknown>;
}
export interface NotificationRuleCreateDTO {
  workspaceId: string;
  name: string;
  category: string;
  sourceMetric: string;
  operator: string;
  threshold: number;
  durationSeconds: number;
  cooldownSeconds: number;
  severity: string;
  providerTarget: string[];
  aiAnalysis: boolean;
}
import type { AutomationCondition, AutomationAction } from '@mydash/shared';
export interface AutomationCreateDTO {
  workspaceId: string;
  name: string;
  description?: string;
  trigger: {
    type: string;
    eventCategory?: string;
    eventType?: string;
    scheduleCron?: string | null;
    scheduleIntervalMs?: number | null;
  };
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  enabled?: boolean;
  cooldownSeconds?: number;
  maxRetry?: number;
  timeoutSeconds?: number;
  requiresApproval?: boolean;
}
