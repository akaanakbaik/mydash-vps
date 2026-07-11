import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index.js';
import type { PgPoolManager } from './pool.js';
import type { Logger } from '../logging/index.js';
import type { DatabaseConnection } from '../infrastructure/database/connection.js';
export type DrizzleClient = NodePgDatabase<typeof schema>;
export class DrizzleConnection implements DatabaseConnection {
  private db: DrizzleClient | null = null;
  private readonly poolManager: PgPoolManager;
  private readonly logger: Logger;
  constructor(poolManager: PgPoolManager, logger: Logger) {
    this.poolManager = poolManager;
    this.logger = logger;
  }
  connect(): Promise<void> {
    const pool = this.poolManager.getPgPool();
    this.db = drizzle(pool, { schema });
    this.logger.info('drizzle connection created');
    return Promise.resolve();
  }
  disconnect(): Promise<void> {
    this.db = null;
    this.logger.info('drizzle connection released');
    return Promise.resolve();
  }
  async healthCheck(): Promise<boolean> {
    return this.poolManager.healthCheck();
  }
  isConnected(): boolean {
    return this.db !== null;
  }
  getDb(): DrizzleClient {
    if (!this.db) {
      throw new Error('Drizzle not connected');
    }
    return this.db;
  }
}
