import type { Severity } from '../enums/severity.js';
import type { Priority } from '../enums/priority.js';
export interface QueueJob {
  id: string;
  workspaceId: string;
  serverId: string;
  jobType: QueueJobType;
  priority: Priority;
  severity: Severity;
  status: QueueJobStatus;
  payload: unknown;
  payloadHash: string;
  retryCount: number;
  maxRetry: number;
  cooldownMs: number;
  correlationId: string;
  workerId: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string;
  errorDetails: string | null;
}
export enum QueueJobType {
  Notification = 'notification',
  Automation = 'automation',
  Analytics = 'analytics',
  AI = 'ai',
  Backup = 'backup',
  Restore = 'restore',
  GitHub = 'github',
  Tunnel = 'tunnel',
  Plugin = 'plugin',
  Audit = 'audit',
}
export enum QueueJobStatus {
  Pending = 'pending',
  Waiting = 'waiting',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
  Retrying = 'retrying',
  Cancelled = 'cancelled',
  DeadLetter = 'deadLetter',
}
export interface QueueStats {
  totalJobs: number;
  pendingJobs: number;
  runningJobs: number;
  failedJobs: number;
  deadLetterJobs: number;
  averageWaitTimeMs: number;
  averageProcessingTimeMs: number;
  throughputPerMinute: number;
  successRate: number;
  failureRate: number;
}
export enum CircuitBreakerState {
  Closed = 'closed',
  HalfOpen = 'halfOpen',
  Open = 'open',
}
