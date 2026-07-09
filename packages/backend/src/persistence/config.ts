import type { PoolConfig } from '../infrastructure/database/pool.js';

export interface DatabaseConfig {
  pool: PoolConfig;
  debug: boolean;
  migrateOnStart: boolean;
  seedOnStart: boolean;
}

export function createDatabaseConfig(env: Record<string, string | undefined>): DatabaseConfig {
  return {
    pool: {
      host: env.DB_HOST ?? 'localhost',
      port: Number(env.DB_PORT ?? '5432'),
      database: env.DB_NAME ?? 'mydash',
      user: env.DB_USER ?? 'mydash',
      password: env.DB_PASSWORD ?? '',
      max: Number(env.DB_POOL_MAX ?? '20'),
      idleTimeoutMs: Number(env.DB_POOL_IDLE_TIMEOUT ?? '30000'),
    },
    debug: env.DB_DEBUG === 'true',
    migrateOnStart: env.DB_MIGRATE_ON_START !== 'false',
    seedOnStart: env.DB_SEED_ON_START === 'true',
  };
}
