export interface SchedulerTask {
  id: string;
  workspaceId: string;
  serverId: string;
  name: string;
  scheduleType: ScheduleType;
  cronExpression: string | null;
  intervalMs: number | null;
  priority: number;
  enabled: boolean;
  timeoutMs: number;
  maxRetry: number;
  dependencyTaskIds: string[];
  nextExecutionAt: string | null;
  lastExecutionAt: string | null;
  lastStatus: TaskStatus | null;
  createdAt: string;
  updatedAt: string;
}

export enum ScheduleType {
  Cron = 'cron',
  Interval = 'interval',
  OneTime = 'oneTime',
}

export enum TaskStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
  Skipped = 'skipped',
}

export interface SchedulerExecution {
  id: string;
  taskId: string;
  status: TaskStatus;
  startedAt: string;
  completedAt: string | null;
  durationMs: number;
  retryCount: number;
  errorDetails: string | null;
  correlationId: string;
}
