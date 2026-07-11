import Redis from 'ioredis';
import type { Logger } from '../../logging/index.js';
import type { RedisConnection, RedisClient } from '../../infrastructure/redis/connection.js';
export class IoRedisConnection implements RedisConnection, RedisClient {
  private client: Redis | null = null;
  private readonly logger: Logger;
  private readonly url: string;
  constructor(logger: Logger, url: string) {
    this.logger = logger;
    this.url = url;
  }
  async connect(): Promise<void> {
    this.client = new Redis(this.url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 10) return null;
        return Math.min(times * 200, 3000);
      },
    });
    this.client.on('error', (err: Error) => { this.logger.error(`redis error: ${err.message}`); });
    await this.client.ping();
    this.logger.info('redis connected');
  }
  async disconnect(): Promise<void> {
    const c = this.client;
    if (c) {
      await c.quit();
      this.client = null;
      this.logger.info('redis disconnected');
    }
  }
  async healthCheck(): Promise<boolean> {
    const c = this.client;
    if (!c) return false;
    try {
      await c.ping();
      return true;
    } catch {
      return false;
    }
  }
  async get(key: string): Promise<string | null> {
    const c = this.getClient();
    return c.get(key);
  }
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const c = this.getClient();
    if (ttlSeconds) {
      await c.set(key, value, 'EX', ttlSeconds);
    } else {
      await c.set(key, value);
    }
  }
  async del(key: string): Promise<void> {
    const c = this.getClient();
    await c.del(key);
  }
  async exists(key: string): Promise<boolean> {
    const c = this.getClient();
    const result = await c.exists(key);
    return result === 1;
  }
  async publish(channel: string, message: string): Promise<void> {
    const c = this.getClient();
    await c.publish(channel, message);
  }
  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    const c = this.getClient();
    await c.subscribe(channel);
    c.on('message', (ch: string, msg: string) => {
      if (ch === channel) handler(msg);
    });
  }
  getClient(): Redis {
    if (!this.client) throw new Error('Redis not connected');
    return this.client;
  }
}
