import type { MetricType } from './metrics.js';
export interface Agent {
  id: string;
  workspaceId: string;
  serverId: string;
  version: string;
  status: AgentStatus;
  heartbeatIntervalMs: number;
  lastHeartbeat: string | null;
  collectorStatus: CollectorStatus[];
  offlineQueueSize: number;
  reconnectCount: number;
  crashCount: number;
  cpuUsagePercent: number;
  memoryUsageBytes: number;
  startedAt: string;
  createdAt: string;
}
export enum AgentStatus {
  Online = 'online',
  Offline = 'offline',
  Degraded = 'degraded',
  Starting = 'starting',
  Stopping = 'stopping',
}
export interface CollectorStatus {
  metricType: MetricType;
  status: CollectorState;
  lastCollectedAt: string | null;
  errorCount: number;
  latencyMs: number;
}
export enum CollectorState {
  Active = 'active',
  Failed = 'failed',
  Disabled = 'disabled',
  Recovering = 'recovering',
}
