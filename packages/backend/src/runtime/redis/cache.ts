import type { IoRedisConnection } from './connection.js';
import type { CacheManager, CacheStats } from '../../infrastructure/redis/cache.js';
import type { Logger } from '../../logging/index.js';
export class RedisCacheManager implements CacheManager {
  private readonly redis: IoRedisConnection;
  private readonly logger: Logger;
  private hits = 0;
  private misses = 0;
  private readonly prefix: string;
  constructor(redis: IoRedisConnection, logger: Logger, prefix: string = 'cache:') {
    this.redis = redis;
    this.logger = logger;
    this.prefix = prefix;
  }
  async get(key: string): Promise<unknown> {
    const raw = await this.redis.get(this.prefix + key);
    if (raw === null) {
      this.misses++;
      return null;
    }
    this.hits++;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.redis.set(this.prefix + key, serialized, ttlSeconds);
  }
  async delete(key: string): Promise<void> {
    await this.redis.del(this.prefix + key);
  }
  async exists(key: string): Promise<boolean> {
    return this.redis.exists(this.prefix + key);
  }
  clear(): Promise<void> {
    this.hits = 0;
    this.misses = 0;
    this.logger.info('cache cleared');
    return Promise.resolve();
  }
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRatio: total > 0 ? this.hits / total : 0,
      keyCount: 0,
    };
  }
}
