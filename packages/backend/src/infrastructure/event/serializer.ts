import type { DomainEvent } from '@mydash/shared';
export interface EventSerializer {
  serialize(event: DomainEvent): string;
  deserialize(raw: string): DomainEvent;
  serializeBatch(events: DomainEvent[]): string[];
  deserializeBatch(rawList: string[]): DomainEvent[];
}
