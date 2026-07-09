/* ─────────── Channel Definitions ─────────── */

export const CHANNELS = [
  'dashboard', 'monitoring', 'analytics', 'health',
  'notification', 'automation', 'servers', 'backup',
  'docker', 'tunnel', 'github', 'plugin',
  'security', 'audit', 'settings', 'profile',
  'session', 'role',
] as const;

export type Channel = (typeof CHANNELS)[number];

/* ─────────── Connection State ─────────── */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'degraded' | 'offline';

export interface ConnectionState {
  status: ConnectionStatus;
  latency: number;
  lastPong: number;
  reconnectAttempt: number;
  nextReconnectDelay: number;
  uptime: number;
}

/* ─────────── Event Envelope ─────────── */

export interface RealtimeEvent {
  id: string;
  correlationId: string;
  traceId: string;
  workspaceId: string;
  serverId?: string;
  channel: Channel;
  type: string;
  version: number;
  sequence: number;
  timestamp: string;
  payload: unknown;
  checksum?: string;
}

/* ─────────── Event Types ─────────── */

export const EVENT_TYPES = {
  monitoring: ['metric.ingested', 'metric.updated', 'metric.deleted'],
  analytics: ['analytics.generated', 'analytics.updated'],
  health: ['health.updated', 'health.changed'],
  notification: ['notification.created', 'notification.sent', 'notification.failed'],
  automation: ['automation.started', 'automation.completed', 'automation.failed', 'automation.cancelled'],
  servers: ['server.created', 'server.updated', 'server.deleted', 'server.online', 'server.offline', 'server.degraded'],
  backup: ['backup.started', 'backup.completed', 'backup.failed'],
  docker: ['container.started', 'container.stopped', 'container.updated'],
  tunnel: ['tunnel.connected', 'tunnel.disconnected'],
  github: ['workflow.started', 'workflow.completed'],
  plugin: ['plugin.installed', 'plugin.updated', 'plugin.removed'],
  security: ['security.alert'],
  audit: ['audit.created'],
  session: ['session.created', 'session.expired', 'session.revoked'],
  profile: ['profile.updated'],
  settings: ['settings.updated'],
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES][number];

export const CHANNEL_EVENT_TYPES: Record<Channel, readonly string[]> = EVENT_TYPES as unknown as Record<Channel, readonly string[]>;

/* ─────────── Subscription ─────────── */

export interface Subscription {
  id: string;
  channel: Channel;
  types?: string[];
  handler: (event: RealtimeEvent) => void;
}

export type UnsubscribeFn = () => void;

/* ─────────── Event Queue ─────────── */

export interface QueuedEvent {
  event: RealtimeEvent;
  receivedAt: number;
  retryCount: number;
}

/* ─────────── Sync Event ─────────── */

export interface SyncPayload {
  channel: Channel;
  data: unknown;
  sequence: number;
}

export interface DeltaPayload {
  channel: Channel;
  key: string;
  value: unknown;
  operation: 'set' | 'update' | 'delete' | 'append';
}

/* ─────────── Heartbeat ─────────── */

export interface HeartbeatMessage {
  type: 'ping' | 'pong';
  timestamp: string;
  sequence: number;
}

/* ─────────── Connection Config ─────────── */

export interface RealtimeConfig {
  baseDelay: number;
  maxDelay: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  ringBufferSize: number;
  jitter: number;
}

export const DEFAULT_REALTIME_CONFIG: RealtimeConfig = {
  baseDelay: 2_000,
  maxDelay: 60_000,
  maxReconnectAttempts: 20,
  heartbeatInterval: 30_000,
  heartbeatTimeout: 10_000,
  ringBufferSize: 512,
  jitter: 0.1,
};
