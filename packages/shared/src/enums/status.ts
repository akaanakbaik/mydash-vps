export enum ServiceStatus {
  Uninitialized = 'uninitialized',
  Initializing = 'initializing',
  Ready = 'ready',
  Degraded = 'degraded',
  Recovering = 'recovering',
  Stopping = 'stopping',
  Offline = 'offline',
}
export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Failed = 'failed',
}
export enum AutomationStatus {
  Pending = 'pending',
  Running = 'running',
  Waiting = 'waiting',
  Success = 'success',
  Failed = 'failed',
  Cancelled = 'cancelled',
  RolledBack = 'rolledBack',
  Blocked = 'blocked',
}
export enum DeliveryStatus {
  Created = 'created',
  Queued = 'queued',
  Sending = 'sending',
  Delivered = 'delivered',
  Failed = 'failed',
  Retrying = 'retrying',
  Cancelled = 'cancelled',
  Expired = 'expired',
}
export enum BackupStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Verifying = 'verifying',
}
export enum TunnelStatus {
  Initializing = 'initializing',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Degraded = 'degraded',
  Reconnecting = 'reconnecting',
  Failover = 'failover',
}
