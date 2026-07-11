import type { IoRedisConnection } from './connection.js';
import type { StreamManager, StreamEntry } from '../../infrastructure/redis/stream.js';
import type { Logger } from '../../logging/index.js';
export class RedisStreamManager implements StreamManager {
  private readonly redis: IoRedisConnection;
  private readonly logger: Logger;
  constructor(redis: IoRedisConnection, logger: Logger) {
    this.redis = redis;
    this.logger = logger;
  }
  async add(stream: string, entry: Record<string, string>): Promise<string> {
    const args: string[] = [];
    for (const [k, v] of Object.entries(entry)) {
      args.push(k, v);
    }
    const client = this.redis.getClient();
    const id = await client.xadd(stream, '*', ...args);
    return id ?? '';
  }
  async read(stream: string, lastId: string, count: number): Promise<StreamEntry[]> {
    const client = this.redis.getClient();
    const results = await client.xread('COUNT', count, 'BLOCK', 1000, 'STREAMS', stream, lastId);
    if (!results) return [];
    const entries: StreamEntry[] = [];
    for (const [, msgs] of results) {
      for (const [id, fields] of msgs as Array<[string, string[]]>) {
        const data: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          data[fields[i]] = fields[i + 1];
        }
        entries.push({ id, data });
      }
    }
    return entries;
  }
  async ack(stream: string, group: string, id: string): Promise<void> {
    const client = this.redis.getClient();
    await client.xack(stream, group, id);
  }
  async createGroup(stream: string, group: string): Promise<void> {
    const client = this.redis.getClient();
    try {
      await client.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
    } catch {
      this.logger.info(`group ${group} already exists for stream ${stream}`);
    }
  }
  async pendingEntries(stream: string, group: string): Promise<StreamEntry[]> {
    const client = this.redis.getClient();
    await client.xpending(stream, group);
    return [];
  }
}
