import type { QueryClient } from '@tanstack/react-query';
import { ConnectionManager } from './connection.js';
import { SubscriptionManager } from './subscription.js';
import { EventBus } from './eventBus.js';
import { createQuerySyncMap } from './querySync.js';
import type { Channel, ConnectionState, ConnectionStatus, RealtimeEvent, UnsubscribeFn } from './types.js';
export type { ConnectionState, ConnectionStatus, Channel, RealtimeEvent, UnsubscribeFn };
export class RealtimeManager {
  readonly connection: ConnectionManager;
  readonly subscriptions: SubscriptionManager;
  readonly events: EventBus;
  private queryClient: QueryClient | null = null;
  private syncHandlers: Map<string, (client: QueryClient, event: RealtimeEvent) => void> = new Map();
  private isInitialized = false;
  private disposeHandlers: (() => void)[] = [];
  constructor(token?: string) {
    this.connection = new ConnectionManager(token);
    this.subscriptions = new SubscriptionManager(this.connection);
    this.events = new EventBus();
    const dispose = this.connection.subscribeToEvents((event) => {
      this.events.dispatch(event);
    });
    this.disposeHandlers.push(dispose);
  }
  init(queryClient: QueryClient): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.queryClient = queryClient;
    this.syncHandlers = createQuerySyncMap(queryClient);
    const dispose = this.events.onChannel('*' as unknown as Channel, (event) => {
      this.syncToCache(event);
    });
    this.disposeHandlers.push(dispose);
  }
  connect(): void {
    this.connection.connect();
  }
  disconnect(): void {
    this.connection.disconnect();
  }
  getState(): ConnectionState {
    return this.connection.getState();
  }
  onConnectionState(handler: (state: ConnectionState) => void): () => void {
    return this.connection.onConnectionState(handler);
  }
  onStatusChange(handler: (status: ConnectionStatus, previous: ConnectionStatus) => void): () => void {
    return this.connection.onStatusChange(handler);
  }
  subscribe(channel: Channel, handler: (event: RealtimeEvent) => void, types?: string[]): UnsubscribeFn {
    const id = `sub-${channel}-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
    return this.subscriptions.subscribe(id, channel, handler, types);
  }
  subscribeToType(eventType: string, handler: (event: RealtimeEvent) => void): UnsubscribeFn {
    return this.events.on(eventType, handler);
  }
  subscribeToChannel(channel: Channel, handler: (event: RealtimeEvent) => void): UnsubscribeFn {
    return this.events.onChannel(channel, handler);
  }
  private syncToCache(event: RealtimeEvent): void {
    if (!this.queryClient) return;
    const handler = this.syncHandlers.get(event.type);
    if (handler) {
      try {
        handler(this.queryClient, event);
      } catch {
        void this.queryClient.invalidateQueries({ queryKey: [event.channel] });
      }
    }
  }
  onEvent(eventType: string, handler: (event: RealtimeEvent) => void, filter?: (event: RealtimeEvent) => boolean): UnsubscribeFn {
    return this.events.on(eventType, handler, filter);
  }
  isConnected(): boolean {
    return this.connection.getStatus() === 'connected';
  }
  getActiveChannels(): Channel[] {
    return this.subscriptions.getActiveChannels();
  }
  getRingBuffer(): RealtimeEvent[] {
    return this.connection.getRingBuffer();
  }
  dispose(): void {
    this.connection.disconnect();
    this.subscriptions.dispose();
    this.events.dispose();
    this.syncHandlers.clear();
    this.isInitialized = false;
    for (const dispose of this.disposeHandlers) {
      dispose();
    }
    this.disposeHandlers = [];
  }
}
let globalRealtimeManager: RealtimeManager | null = null;
export function getRealtimeManager(token?: string): RealtimeManager {
  if (!globalRealtimeManager) {
    globalRealtimeManager = new RealtimeManager(token);
  }
  return globalRealtimeManager;
}
export function resetRealtimeManager(): void {
  if (globalRealtimeManager) {
    globalRealtimeManager.dispose();
    globalRealtimeManager = null;
  }
}
