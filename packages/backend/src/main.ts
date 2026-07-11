import { createLogger } from './logging/index.js';
import { loadConfig } from './configuration/index.js';
import { createServiceContainer } from './infrastructure/utilities.js';
import { registerPersistence, createDatabaseConfig, SeedRunner, initialSeed } from './persistence/index.js';
import type { DrizzleClient } from './persistence/connection.js';
import { registerRuntime } from './runtime/index.js';
import { registerApplication } from './application/di.js';
import { registerTransport } from './transport/di.js';
import { createLifecycle } from './bootstrap/lifecycle.js';
import { createModuleRegistry } from './modules/index.js';
import type { LifecycleDependencies } from './bootstrap/lifecycle.js';
function parseDatabaseUrl(url?: string): void {
  if (!url) return;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const port = parsed.port || '5432';
    const database = parsed.pathname.replace(/^\//, '')
    const user = decodeURIComponent(parsed.username);
    const password = decodeURIComponent(parsed.password);
    if (host) process.env['DB_HOST'] = host;
    if (port) process.env['DB_PORT'] = port;
    if (database) process.env['DB_NAME'] = database;
    if (user) process.env['DB_USER'] = user;
    if (password) process.env['DB_PASSWORD'] = password;
  } catch {
  }
}
async function main(): Promise<void> {
  parseDatabaseUrl(process.env['DATABASE_URL']);
  process.env['PORT'] ??= process.env['BACKEND_PORT'];
  const env = process.env as Record<string, string | undefined>;
  const config = loadConfig();
  const logger = createLogger('system', config.system.logLevel);
  logger.info('Starting MyDash Backend...');
  logger.info('Environment', { nodeEnv: config.system.nodeEnv, port: config.system.port });
  const container = createServiceContainer(logger);
  const moduleRegistry = createModuleRegistry(logger, config);
  const dbConfig = createDatabaseConfig(env);
  await registerPersistence(container, dbConfig, logger);
  logger.success('PostgreSQL connected');
  const dbClient = container.resolve('dbClient') as DrizzleClient;
  const seedRunner = new SeedRunner(dbClient, logger);
  seedRunner.register(initialSeed);
  await seedRunner.runAll();
  logger.success('Database seeds applied');
  registerRuntime(container, env, logger);
  logger.success('Redis connected');
  registerApplication(container, logger);
  logger.success('Application services registered');
  const httpServer = registerTransport(container, env, logger);
  const wsServer = container.resolve('wsServer') as { stop: () => Promise<void> } | undefined;
  const dbConnection = container.resolve('dbConnection') as { disconnect: () => Promise<void> } | undefined;
  const redisConnection = container.resolve('redisConnection') as { disconnect: () => Promise<void> } | undefined;
  const eventBus = container.resolve('eventPublisher') as { stop: () => Promise<void> } | undefined;
  const deps: LifecycleDependencies = {
    logger,
    moduleRegistry,
    httpServer,
    wsServer,
    dbConnection,
    redisConnection,
    eventBus,
  };
  const lifecycle = createLifecycle(deps);
  const shutdownHandler = (signal: string) => {
    logger.info(`Received ${signal}, shutting down...`);
    lifecycle.shutdown().catch((err: unknown) => {
      logger.error('Shutdown failed', err instanceof Error ? err : new Error(String(err)));
      process.exit(1);
    });
  };
  process.on('SIGINT', () => { shutdownHandler('SIGINT'); });
  process.on('SIGTERM', () => { shutdownHandler('SIGTERM'); });
  logger.success(`MyDash Backend ready on port ${String(config.system.port)}`);
}
main().catch((err: unknown) => {
  const logger = createLogger('system', 'error');
  logger.error('Failed to start application', err instanceof Error ? err : new Error(String(err)));
  process.exit(1);
});
