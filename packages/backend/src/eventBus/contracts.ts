import type { DomainEvent } from '@mydash/shared';

export interface EventBus {
  start(): Promise<void>;
  stop(): Promise<void>;
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
  healthCheck(): Promise<boolean>;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;
