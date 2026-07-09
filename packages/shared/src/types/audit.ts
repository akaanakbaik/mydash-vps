import type { Severity } from '../enums/severity.js';

export interface AuditRecord {
  id: string;
  workspaceId: string;
  userId: string;
  sessionId: string | null;
  device: string | null;
  ipAddress: string | null;
  module: string;
  action: string;
  targetResource: string;
  previousState: unknown;
  newState: unknown;
  result: AuditResult;
  severity: Severity;
  correlationId: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export enum AuditResult {
  Success = 'success',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Blocked = 'blocked',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  service: string;
  category: string;
  message: string;
  metadata: Record<string, unknown>;
  correlationId: string;
  traceId: string;
  workspaceId: string | null;
  serverId: string | null;
  durationMs: number | null;
}

export enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Information = 'information',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
  Emergency = 'emergency',
}
