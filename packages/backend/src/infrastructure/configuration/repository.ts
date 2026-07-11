import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { configurations } from '../../persistence/schema/security.js';
import type { ConfigurationRepository } from '../../domain/configuration/index.js';
import type { AppConfig } from '@mydash/shared';
export class ConfigurationRepositoryImpl implements ConfigurationRepository {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }
  async get(workspaceId: string): Promise<AppConfig | null> {
    const rows = await this.db.select().from(configurations).where(eq(configurations.workspaceId, workspaceId));
    if (rows.length === 0) return this.getDefault();
    const config: Record<string, unknown> = {};
    for (const row of rows) {
      config[row.key] = row.value;
    }
    const defaultConfig = this.getDefault();
    return { ...defaultConfig, ...config };
  }
  async save(workspaceId: string, config: AppConfig): Promise<void> {
    const entries = Object.entries(config);
    for (const [key, value] of entries) {
      await this.db.insert(configurations).values({
        workspaceId,
        key,
        value: value as Record<string, unknown>,
        category: key.split('.')[0] ?? 'general',
      }).onConflictDoUpdate({
        target: [configurations.workspaceId, configurations.key],
        set: { value: value as Record<string, unknown> },
      });
    }
  }
  getDefault(): AppConfig {
    return {
      system: { logLevel: 'info', nodeEnv: 'development' },
      database: { host: 'localhost', port: 5432, name: 'mydash' },
      redis: { host: 'localhost', port: 6379 },
      authentication: { jwtSecret: '', jwtExpiresIn: '24h', bcryptRounds: 10, sessionTimeout: 1440 },
      monitoring: { interval: 30, retention: 90 },
      notification: { defaultProvider: 'telegram', retryCount: 3 },
      security: { maxLoginAttempts: 5, passwordMinLength: 12 },
    } as unknown as AppConfig;
  }
}
