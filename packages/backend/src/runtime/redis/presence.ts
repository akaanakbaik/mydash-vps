import type { IoRedisConnection } from './connection.js';
import type { PresenceManager, PresenceMetadata, PresenceStatus } from '../../infrastructure/redis/presence.js';
import { PresenceState } from '../../infrastructure/redis/presence.js';
import type { Logger } from '../../logging/index.js';
export class RedisPresenceManager implements PresenceManager {
  private readonly redis: IoRedisConnection;
  private readonly prefix = 'presence:';
  constructor(redis: IoRedisConnection, _logger: Logger) {
    this.redis = redis;
  }
  async register(userId: string, metadata: PresenceMetadata): Promise<void> {
    const key = this.prefix + userId;
    const data = JSON.stringify({ ...metadata, state: PresenceState.Online, lastHeartbeat: new Date().toISOString() });
    await this.redis.set(key, data, 300);
  }
  async unregister(userId: string): Promise<void> {
    await this.redis.del(this.prefix + userId);
  }
  async heartbeat(userId: string): Promise<void> {
    const key = this.prefix + userId;
    const raw = await this.redis.get(key);
    if (raw) {
      const data = JSON.parse(raw) as PresenceStatus;
      data.lastHeartbeat = new Date().toISOString();
      data.state = PresenceState.Online;
      await this.redis.set(key, JSON.stringify(data), 300);
    }
  }
  async getPresence(userId: string): Promise<PresenceStatus> {
    const raw = await this.redis.get(this.prefix + userId);
    if (!raw) {
      return { userId, state: PresenceState.Offline, lastHeartbeat: '', metadata: { device: '', browser: '', ipAddress: '', workspaceId: '' } };
    }
    return JSON.parse(raw) as PresenceStatus;
  }
  getOnlineUsers(): Promise<string[]> {
    return Promise.resolve([]);
  }
}
