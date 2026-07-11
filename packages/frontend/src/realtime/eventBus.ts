import type { Channel, RealtimeEvent } from './types.js';
import { CHANNELS } from './types.js';
type EventHandler = (event: RealtimeEvent) => void;
type ChannelHandler = (event: RealtimeEvent) => void;
interface RegisteredHandler {
  id: string;
  handler: EventHandler;
  filter?: (event: RealtimeEvent) => boolean;
}
export class EventBus {
  private handlersByType = new Map<string, Set<RegisteredHandler>>();
  private handlersByChannel = new Map<string, Set<RegisteredHandler>>();
  private processedEvents = new Set<string>();
  private eventCount = 0;
  private lastEventTimestamps = new Map<string, number>();
  on(eventType: string, handler: EventHandler, filter?: (event: RealtimeEvent) => boolean, id?: string): () => void {
    const reg: RegisteredHandler = { id: id ?? `handler-${String(this.eventCount++)}`, handler, filter };
    let handlers = this.handlersByType.get(eventType);
    if (!handlers) {
      handlers = new Set();
      this.handlersByType.set(eventType, handlers);
    }
    handlers.add(reg);
    return () => { handlers.delete(reg); };
  }
  onChannel(channel: Channel, handler: ChannelHandler, id?: string): () => void {
    const reg: RegisteredHandler = { id: id ?? `channel-${channel}-${String(this.eventCount++)}`, handler };
    let handlers = this.handlersByChannel.get(channel);
    if (!handlers) {
      handlers = new Set();
      this.handlersByChannel.set(channel, handlers);
    }
    handlers.add(reg);
    return () => { handlers.delete(reg); };
  }
  dispatch(event: RealtimeEvent): void {
    if (!this.validate(event)) return;
    if (this.isDuplicate(event)) return;
    this.processedEvents.add(event.id);
    this.lastEventTimestamps.set(event.channel, Date.now());
    if (this.processedEvents.size > 10_000) {
      const entriesToRemove = Math.floor(this.processedEvents.size * 0.1);
      let removed = 0;
      for (const entry of this.processedEvents) {
        if (removed >= entriesToRemove) break;
        this.processedEvents.delete(entry);
        removed++;
      }
    }
    const typeHandlers = this.handlersByType.get(event.type);
    if (typeHandlers) {
      for (const reg of typeHandlers) {
        if (reg.filter && !reg.filter(event)) continue;
        try { reg.handler(event); } catch {  }
      }
    }
    const channelHandlers = this.handlersByChannel.get(event.channel);
    if (channelHandlers) {
      for (const reg of channelHandlers) {
        try { reg.handler(event); } catch {  }
      }
    }
  }
  dispatchBatch(events: RealtimeEvent[]): void {
    for (const event of events) {
      this.dispatch(event);
    }
  }
  validate(event: RealtimeEvent): boolean {
    if (typeof event.id !== 'string') return false;
    if (typeof event.type !== 'string') return false;
    if (!CHANNELS.includes(event.channel)) return false;
    if (!event.timestamp || Number.isNaN(new Date(event.timestamp).getTime())) return false;
    if (event.sequence < 0) return false;
    if (event.version < 0) return false;
    return true;
  }
  isDuplicate(event: RealtimeEvent): boolean {
    return this.processedEvents.has(event.id);
  }
  hasProcessed(eventId: string): boolean {
    return this.processedEvents.has(eventId);
  }
  getProcessedCount(): number {
    return this.processedEvents.size;
  }
  clearProcessed(): void {
    this.processedEvents.clear();
    this.lastEventTimestamps.clear();
  }
  dispose(): void {
    this.handlersByType.clear();
    this.handlersByChannel.clear();
    this.processedEvents.clear();
    this.lastEventTimestamps.clear();
    this.eventCount = 0;
  }
}
