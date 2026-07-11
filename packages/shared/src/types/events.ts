import type { Severity } from '../enums/severity.js';
import type { Priority } from '../enums/priority.js';
import type { EventCategory } from '../enums/category.js';
import type { Metric } from './metrics.js';
export interface EventEnvelope {
  id: string;
  workspaceId: string;
  serverId: string;
  sequenceNumber: number;
  timestamp: string;
  eventType: string;
  payload: unknown;
  checksum: string;
  correlationId: string;
  traceId: string;
  version: number;
}
export interface SystemEvent {
  envelope: EventEnvelope;
  severity: Severity;
  priority: Priority;
  category: EventCategory;
  source: string;
}
export interface MetricEvent extends SystemEvent {
  category: EventCategory.Performance;
  metric: Metric;
}
export interface NotificationEvent extends SystemEvent {
  category: EventCategory.Notification;
  ruleId: string;
  templateId: string;
  providerTarget: string[];
  requiresAI: boolean;
}
export interface AutomationEvent extends SystemEvent {
  category: EventCategory.Automation;
  automationId: string;
  action: string;
  executionContextId: string;
}
export interface HealthEvent extends SystemEvent {
  category: EventCategory.System;
  healthScore: number;
  healthGrade: string;
  previousScore: number;
  delta: number;
  confidence: number;
}
export interface SecurityEvent extends SystemEvent {
  category: EventCategory.Security;
  action: string;
  ipAddress: string | null;
  device: string | null;
  previousState: unknown;
  newState: unknown;
}
export interface TunnelEvent extends SystemEvent {
  category: EventCategory.Tunnel;
  provider: string;
  previousProvider: string;
  url: string;
  reconnectCount: number;
}
export interface BackupEvent extends SystemEvent {
  category: EventCategory.Backup;
  backupId: string;
  mode: string;
  status: string;
  sizeBytes: number;
  durationMs: number;
}
export type DomainEvent =
  | MetricEvent
  | NotificationEvent
  | AutomationEvent
  | HealthEvent
  | SecurityEvent
  | TunnelEvent
  | BackupEvent;
