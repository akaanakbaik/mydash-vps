import type { Logger } from '../logging/index.js';
import type { ModuleRegistry } from '../modules/index.js';
import type { Server } from 'http';
export interface ApplicationLifecycle {
  startup(): Promise<void>;
  shutdown(): Promise<void>;
  isReady(): boolean;
}
export interface LifecycleDependencies {
  logger: Logger;
  moduleRegistry: ModuleRegistry;
  httpServer: Server;
  wsServer?: { stop: () => Promise<void> };
  dbConnection?: { disconnect: () => Promise<void> };
  redisConnection?: { disconnect: () => Promise<void> };
  eventBus?: { stop: () => Promise<void> };
  queueManager?: { drain: () => Promise<void>; stop: () => Promise<void> };
  schedulerManager?: { stop: () => Promise<void> };
}
export function createLifecycle(deps: LifecycleDependencies): ApplicationLifecycle {
  let ready = false;
  const { logger, moduleRegistry, httpServer, wsServer, dbConnection, redisConnection, eventBus, queueManager, schedulerManager } = deps;
  async function gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    ready = false;
    logger.info('Stopping HTTP server...');
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        logger.info('HTTP server stopped');
        resolve();
      });
    });
    if (queueManager) {
      logger.info('Draining queue...');
      try { await queueManager.drain(); logger.info('Queue drained'); } catch (e) { logger.error('Queue drain failed', e instanceof Error ? e : new Error(String(e))); }
      try { await queueManager.stop(); logger.info('Queue stopped'); } catch (e) { logger.error('Queue stop failed', e instanceof Error ? e : new Error(String(e))); }
    }
    if (schedulerManager) {
      logger.info('Stopping scheduler...');
      try { await schedulerManager.stop(); logger.info('Scheduler stopped'); } catch (e) { logger.error('Scheduler stop failed', e instanceof Error ? e : new Error(String(e))); }
    }
    if (eventBus) {
      logger.info('Stopping event bus...');
      try { await eventBus.stop(); logger.info('Event bus stopped'); } catch (e) { logger.error('Event bus stop failed', e instanceof Error ? e : new Error(String(e))); }
    }
    if (wsServer) {
      logger.info('Stopping WebSocket server...');
      try { await wsServer.stop(); logger.info('WebSocket server stopped'); } catch (e) { logger.error('WebSocket stop failed', e instanceof Error ? e : new Error(String(e))); }
    }
    logger.info('Shutting down modules...');
    try { await moduleRegistry.shutdownAll(); logger.info('Modules shutdown complete'); } catch (e) { logger.error('Module shutdown failed', e instanceof Error ? e : new Error(String(e))); }
    if (dbConnection) {
      logger.info('Closing database connection...');
      try { await dbConnection.disconnect(); logger.info('Database connection closed'); } catch (e) { logger.error('Database disconnect failed', e instanceof Error ? e : new Error(String(e))); }
    }
    if (redisConnection) {
      logger.info('Closing Redis connection...');
      try { await redisConnection.disconnect(); logger.info('Redis connection closed'); } catch (e) { logger.error('Redis disconnect failed', e instanceof Error ? e : new Error(String(e))); }
    }
    logger.info('Graceful shutdown complete');
    process.exit(0);
  }
  return {
    async startup(): Promise<void> {
      const shutdownHandler = (signal: string) => {
        gracefulShutdown(signal).catch((err: unknown) => {
          logger.error('Shutdown failed', err instanceof Error ? err : new Error(String(err)));
          process.exit(1);
        });
      };
      process.on('SIGINT', () => { shutdownHandler('SIGINT'); });
      process.on('SIGTERM', () => { shutdownHandler('SIGTERM'); });
      await moduleRegistry.resolveAll();
      ready = true;
      logger.success('Application started successfully');
    },
    async shutdown(): Promise<void> {
      await gracefulShutdown('MANUAL');
    },
    isReady(): boolean {
      return ready;
    },
  };
}
