import { createServer } from 'http';
import type { ServiceContainer } from '../infrastructure/utilities.js';
import { createExpressApp } from './http/app.js';
import { createReadinessRouter } from './http/router.js';
import { createWebSocketServer } from './ws/server.js';
import { createTransportConfig } from './config.js';
import type { Logger } from '../logging/index.js';
import type { Server } from 'http';
export function registerTransport(container: ServiceContainer, env: Record<string, string | undefined>, logger: Logger): Server {
  const config = createTransportConfig(env);
  const readinessCheck = async (): Promise<boolean> => {
    try {
      const dbChecker = container.resolve('dbHealthChecker') as { check: () => Promise<{ status: string }> };
      const redisChecker = container.resolve('redisHealthChecker') as { check: () => Promise<{ status: string }> };
      const dbResult = await dbChecker.check();
      const redisResult = await redisChecker.check();
      return dbResult.status !== 'unhealthy' && redisResult.status !== 'unhealthy';
    } catch {
      return false;
    }
  };
  const registry = container.resolve('serviceRegistry') as { resolve: (key: string) => unknown } | undefined;
  const jwtSecret = env['JWT_SECRET'] ?? 'dev-secret';
  const app = createExpressApp(logger, jwtSecret, registry as Parameters<typeof createExpressApp>[2]);
  app.use('/readiness', createReadinessRouter(readinessCheck));
  const server = createServer(app);
  const wsServer = createWebSocketServer(server, logger, { path: config.wsPath });
  app.set('wsServer', wsServer);
  container.register('wsServer', () => wsServer);
  server.listen(config.port, config.host, () => {
    logger.info(`server listening on ${config.host}:${String(config.port)}`);
  });
  container.register('httpServer', () => server);
  container.register('expressApp', () => app);
  return server;
}
