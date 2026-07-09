import type { IoRedisConnection } from './connection.js';
import type { DistributedLock } from '../../infrastructure/redis/lock.js';
import type { Logger } from '../../logging/index.js';

export class RedisDistributedLock implements DistributedLock {
  private readonly redis: IoRedisConnection;

  constructor(redis: IoRedisConnection, _logger: Logger) {
    this.redis = redis;
  }

  async acquire(key: string, ttlMs: number): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const token = crypto.randomUUID();
    const result = await this.redis.get(lockKey);
    if (result !== null) return false;
    await this.redis.set(lockKey, token, Math.ceil(ttlMs / 1000));
    return true;
  }

  async release(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.redis.del(lockKey);
  }

  async extend(key: string, ttlMs: number): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const exists = await this.redis.exists(lockKey);
    if (!exists) return false;
    await this.redis.set(lockKey, 'extended', Math.ceil(ttlMs / 1000));
    return true;
  }

  async isLocked(key: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    return this.redis.exists(lockKey);
  }
}
