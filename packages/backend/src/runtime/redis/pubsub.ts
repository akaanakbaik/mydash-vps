import type { IoRedisConnection } from './connection.js';
import type { RedisPubSub, PubSubMessage } from '../../infrastructure/redis/pubsub.js';
import type { Logger } from '../../logging/index.js';
export class RedisPubSubManager implements RedisPubSub {
  private readonly redis: IoRedisConnection;
  private readonly handlers = new Map<string, Array<(msg: string) => void>>();
  private connected = false;
  constructor(redis: IoRedisConnection, _logger: Logger) {
    this.redis = redis;
  }
  async publish(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message);
  }
  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    await this.redis.subscribe(channel, handler);
    const existing = this.handlers.get(channel) ?? [];
    existing.push(handler);
    this.handlers.set(channel, existing);
    this.connected = true;
  }
  unsubscribe(channel: string): Promise<void> {
    this.handlers.delete(channel);
    return Promise.resolve();
  }
  isConnected(): boolean {
    return this.connected;
  }
  createMessage(channel: string, payload: unknown): PubSubMessage {
    return { channel, payload, timestamp: new Date().toISOString() };
  }
}
