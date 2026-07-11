import type { Channel, Subscription, UnsubscribeFn, RealtimeEvent } from './types.js';
import { CHANNELS } from './types.js';
import type { ConnectionManager } from './connection.js';
export class SubscriptionManager {
  private subscriptions = new Map<string, Map<string, Subscription>>();
  private channelSubscriptions = new Map<Channel, Set<string>>();
  private connectionManager: ConnectionManager;
  private pendingResubscribe: Set<Channel> = new Set();
  private disposeHandlers: (() => void)[] = [];
  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
    const dispose = connectionManager.subscribeToEvents((event) => {
      this.dispatchToSubscribers(event);
    });
    this.disposeHandlers.push(dispose);
  }
  subscribe(
    id: string,
    channel: Channel,
    handler: (event: RealtimeEvent) => void,
    types?: string[],
  ): UnsubscribeFn {
    if (!CHANNELS.includes(channel)) {
      console.warn(`[Realtime] Unknown channel: ${channel}`);
      return () => {};
    }
    const sub: Subscription = { id, channel, types, handler };
    let subsForId = this.subscriptions.get(id);
    if (!subsForId) {
      subsForId = new Map();
      this.subscriptions.set(id, subsForId);
    }
    subsForId.set(channel, sub);
    let channelSubIds = this.channelSubscriptions.get(channel);
    if (!channelSubIds) {
      channelSubIds = new Set();
      this.channelSubscriptions.set(channel, channelSubIds);
    }
    channelSubIds.add(id);
    this.sendSubscribe(channel, types);
    return () => {
      this.unsubscribe(id, channel);
    };
  }
  private unsubscribe(id: string, channel: Channel): void {
    const subsForId = this.subscriptions.get(id);
    if (subsForId) {
      subsForId.delete(channel);
      if (subsForId.size === 0) {
        this.subscriptions.delete(id);
      }
    }
    const channelSubIds = this.channelSubscriptions.get(channel);
    if (channelSubIds) {
      channelSubIds.delete(id);
      if (channelSubIds.size === 0) {
        this.sendUnsubscribe(channel);
        this.channelSubscriptions.delete(channel);
      }
    }
  }
  private dispatchToSubscribers(event: RealtimeEvent): void {
    const channel = event.channel;
    if (!CHANNELS.includes(channel)) return;
    const channelKey = channel;
    const subIds = this.channelSubscriptions.get(channelKey);
    if (!subIds) return;
    for (const id of subIds) {
      const subsForId = this.subscriptions.get(id);
      if (!subsForId) continue;
      const sub = subsForId.get(channelKey);
      if (!sub) continue;
      if (sub.types && event.type && !sub.types.includes(event.type)) continue;
      try {
        sub.handler(event);
      } catch {
      }
    }
  }
  resubscribeAll(): void {
    for (const [channel, subIds] of this.channelSubscriptions) {
      if (subIds.size > 0) {
        this.sendSubscribe(channel);
      }
    }
  }
  getActiveChannels(): Channel[] {
    return Array.from(this.channelSubscriptions.keys());
  }
  getSubscriptionCount(): number {
    let count = 0;
    for (const subs of this.channelSubscriptions.values()) {
      count += subs.size;
    }
    return count;
  }
  hasChannelSubscribers(channel: Channel): boolean {
    const subs = this.channelSubscriptions.get(channel);
    return subs !== undefined && subs.size > 0;
  }
  private sendSubscribe(channel: Channel, types?: string[]): void {
    this.connectionManager.send('subscribe', { channel, types });
  }
  private sendUnsubscribe(channel: Channel): void {
    this.connectionManager.send('unsubscribe', { channel });
  }
  dispose(): void {
    this.subscriptions.clear();
    this.channelSubscriptions.clear();
    this.pendingResubscribe.clear();
    for (const dispose of this.disposeHandlers) {
      dispose();
    }
    this.disposeHandlers = [];
  }
}
