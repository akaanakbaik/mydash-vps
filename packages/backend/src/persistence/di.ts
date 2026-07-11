import type { ServiceContainer } from '../infrastructure/utilities.js';
import { PgPoolManager } from './pool.js';
import { DrizzleConnection } from './connection.js';
import { DrizzleMigrationRunner } from './migration/runner.js';
import { DrizzleTransactionManager } from './repository/transaction.js';
import { DatabaseHealthChecker } from './health.js';
import type { Logger } from '../logging/index.js';
import type { DatabaseConfig } from './config.js';
export async function registerPersistence(container: ServiceContainer, config: DatabaseConfig, logger: Logger): Promise<void> {
  const poolManager = new PgPoolManager(logger);
  await poolManager.connect(config.pool);
  const dbConnection = new DrizzleConnection(poolManager, logger);
  await dbConnection.connect();
  const dbClient = dbConnection.getDb();
  const migrationRunner = new DrizzleMigrationRunner(logger);
  const transactionManager = new DrizzleTransactionManager(dbClient, logger);
  const healthChecker = new DatabaseHealthChecker(dbClient, logger);
  container.register('poolManager', () => poolManager);
  container.register('dbConnection', () => dbConnection);
  container.register('dbClient', () => dbClient);
  container.register('migrationRunner', () => migrationRunner);
  container.register('transactionManager', () => transactionManager);
  container.register('dbHealthChecker', () => healthChecker);
}
