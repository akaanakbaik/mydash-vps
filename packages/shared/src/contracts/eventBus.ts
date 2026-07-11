import type { DomainEvent } from '../types/events.js';
export interface EventBusConfig {
  enabled: boolean;
  maxQueueSize: number;
  retryEnabled: boolean;
  deduplicationEnabled: boolean;
}
export interface EventSubscription {
  eventType: string;
  handler: EventHandler;
}
export type EventHandler = (event: DomainEvent) => Promise<void>;
export interface EventPublishResult {
  success: boolean;
  eventId: string;
  consumerCount: number;
  errors: string[];
}
