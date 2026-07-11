import pg from 'pg';
import type { PoolConfig, PoolManager } from '../infrastructure/database/pool.js';
import type { Logger } from '../logging/index.js';
export class PgPoolManager implements PoolManager {
  private pool: pg.Pool | null = null;
  private readonly logger: Logger;
  constructor(logger: Logger) {
    this.logger = logger;
  }
  async connect(config: PoolConfig): Promise<void> {
    this.pool = new pg.Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMs,
    });
    this.pool.on('error', (err: Error) => {
      this.logger.error(`pg pool error: ${err.message}`);
    });
    await this.pool.query('SELECT 1');
    this.logger.info('pg pool connected');
  }
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.logger.info('pg pool disconnected');
    }
  }
  getPool(): unknown {
    return this.pool;
  }
  getPgPool(): pg.Pool {
    if (!this.pool) {
      throw new Error('Pool not connected');
    }
    return this.pool;
  }
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
