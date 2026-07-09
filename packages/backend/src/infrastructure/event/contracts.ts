import type { DomainEvent } from '@mydash/shared';

export interface EventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
  dispatchBatch(events: DomainEvent[]): Promise<void>;
}

export interface EventPublisher {
  publish(event: DomainEvent): void;
  publishAll(events: DomainEvent[]): void;
}

export interface EventSubscriber {
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
  getSubscribers(eventType: string): EventHandler[];
}

export type EventHandler = (event: DomainEvent) => Promise<void>;

export interface EventRegistry {
  register(eventType: string, handler: EventHandler): void;
  unregister(eventType: string, handler: EventHandler): void;
  getHandlers(eventType: string): EventHandler[];
  getAllEventTypes(): string[];
}
