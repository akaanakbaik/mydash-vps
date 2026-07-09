import type { DomainEvent } from '../types/events.js';

export interface WebSocketEnvelope {
  id: string;
  workspaceId: string;
  serverId: string | null;
  sequenceNumber: number;
  timestamp: string;
  channel: WebSocketChannel;
  eventType: string;
  payload: DomainEvent;
  checksum: string;
  correlationId: string;
  version: number;
}

export enum WebSocketChannel {
  Monitoring = 'monitoring',
  Analytics = 'analytics',
  Notification = 'notification',
  Health = 'health',
  Automation = 'automation',
  Tunnel = 'tunnel',
  Docker = 'docker',
  GitHub = 'github',
  Audit = 'audit',
  Backup = 'backup',
  Restore = 'restore',
  AI = 'ai',
  System = 'system',
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  envelope: WebSocketEnvelope;
}

export enum WebSocketMessageType {
  Event = 'event',
  Snapshot = 'snapshot',
  Heartbeat = 'heartbeat',
  Ack = 'ack',
  Error = 'error',
  Reconnect = 'reconnect',
}

export interface SubscriptionRequest {
  workspaceId: string;
  channels: WebSocketChannel[];
}

export interface WebSocketAuth {
  sessionId: string;
  workspaceId: string;
}
