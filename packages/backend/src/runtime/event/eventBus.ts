import type { DomainEvent } from '@mydash/shared';
import type { EventDispatcher, EventSubscriber, EventPublisher, EventHandler, EventRegistry } from '../../infrastructure/event/contracts.js';
import type { Logger } from '../../logging/index.js';

export class InMemoryEventDispatcher implements EventDispatcher {
  private readonly subscriber: InMemoryEventSubscriber;
  private readonly logger: Logger;

  constructor(subscriber: InMemoryEventSubscriber, logger: Logger) {
    this.subscriber = subscriber;
    this.logger = logger;
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const eventType = event.envelope.eventType;
    const handlers = this.subscriber.getSubscribers(eventType);
    for (const handler of handlers) {
      try {
        this.logger.info(`dispatching ${eventType}`, { correlationId: event.envelope.correlationId });
        await handler(event);
      } catch (err) {
        this.logger.error(`event handler failed for ${eventType}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  async dispatchBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}

export class InMemoryEventSubscriber implements EventSubscriber {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType);
    if (existing) {
      this.handlers.set(eventType, existing.filter((h) => h !== handler));
    }
  }

  getSubscribers(eventType: string): EventHandler[] {
    return this.handlers.get(eventType) ?? [];
  }
}

export class InMemoryEventRegistry implements EventRegistry {
  private readonly handlers = new Map<string, EventHandler[]>();

  register(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  unregister(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType);
    if (existing) {
      this.handlers.set(eventType, existing.filter((h) => h !== handler));
    }
  }

  getHandlers(eventType: string): EventHandler[] {
    return this.handlers.get(eventType) ?? [];
  }

  getAllEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export class InMemoryEventPublisher implements EventPublisher {
  private readonly dispatcher: EventDispatcher;

  constructor(dispatcher: EventDispatcher) {
    this.dispatcher = dispatcher;
  }

  publish(event: DomainEvent): void {
    void this.dispatcher.dispatch(event);
  }

  publishAll(events: DomainEvent[]): void {
    for (const event of events) {
      this.publish(event);
    }
  }
}

export class JsonEventSerializer {
  serialize(event: DomainEvent): string {
    return JSON.stringify(event);
  }

  deserialize(raw: string): DomainEvent {
    return JSON.parse(raw) as DomainEvent;
  }

  serializeBatch(events: DomainEvent[]): string[] {
    return events.map((e) => this.serialize(e));
  }

  deserializeBatch(rawList: string[]): DomainEvent[] {
    return rawList.map((r) => this.deserialize(r));
  }
}
