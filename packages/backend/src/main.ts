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

/**
 * Parse a PostgreSQL connection URL into individual DB_* env vars.
 * This ensures both loadConfig() (reads DATABASE_URL) and
 * createDatabaseConfig(env) (reads DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD)
 * derive values from the same single source of truth.
 */
function parseDatabaseUrl(url?: string): void {
  if (!url) return;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const port = parsed.port || '5432';
    const database = parsed.pathname.replace(/^\//, '');
    const user = decodeURIComponent(parsed.username);
    const password = decodeURIComponent(parsed.password);
    if (host) process.env['DB_HOST'] = host;
    if (port) process.env['DB_PORT'] = port;
    if (database) process.env['DB_NAME'] = database;
    if (user) process.env['DB_USER'] = user;
    if (password) process.env['DB_PASSWORD'] = password;
  } catch {
    // Invalid URL — fall through to env defaults
  }
}

async function main(): Promise<void> {
  // Parse DATABASE_URL into DB_* env vars BEFORE config loading
  // so both config paths use the same single source of truth
  parseDatabaseUrl(process.env['DATABASE_URL']);

  // Sync PORT from BACKEND_PORT if only BACKEND_PORT is set
  // This ensures transport config (reads env.PORT) and system config (reads BACKEND_PORT) are consistent
  process.env['PORT'] ??= process.env['BACKEND_PORT'];

  const env = process.env as Record<string, string | undefined>;
  const config = loadConfig();
  const logger = createLogger('system', config.system.logLevel);

  logger.info('Starting MyDash Backend...');
  logger.info('Environment', { nodeEnv: config.system.nodeEnv, port: config.system.port });

  const container = createServiceContainer(logger);
  const moduleRegistry = createModuleRegistry(logger, config);

  // 1. Connect PostgreSQL (uses parseDatabaseUrl-populated DB_* env vars)
  const dbConfig = createDatabaseConfig(env);
  await registerPersistence(container, dbConfig, logger);
  logger.success('PostgreSQL connected');

  // 2. Run database seeds (creates default workspace + admin user if not exist)
  const dbClient = container.resolve('dbClient') as DrizzleClient;
  const seedRunner = new SeedRunner(dbClient, logger);
  seedRunner.register(initialSeed);
  await seedRunner.runAll();
  logger.success('Database seeds applied');

  // 3. Connect Redis & runtime services
  registerRuntime(container, env, logger);
  logger.success('Redis connected');

  // 4. Register application use cases
  registerApplication(container, logger);
  logger.success('Application services registered');

  // 5. Start HTTP + WebSocket server
  const httpServer = registerTransport(container, env, logger);

  // 6. Wire up graceful shutdown
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
