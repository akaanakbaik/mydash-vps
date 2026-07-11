export interface ApplicationEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly correlationId: string;
  readonly workspaceId: string;
  readonly timestamp: Date;
  readonly payload: unknown;
}
export interface ApplicationEventHandler {
  handledEventTypes: string[];
  handle(event: ApplicationEvent): Promise<void>;
}
export interface ApplicationEventBus {
  publish(event: ApplicationEvent): Promise<void>;
  subscribe(eventType: string, handler: ApplicationEventHandler): void;
  unsubscribe(eventType: string, handler: ApplicationEventHandler): void;
}
export interface ApplicationEventMetadata {
  eventType: string;
  description: string;
  source: string;
  version: number;
}
