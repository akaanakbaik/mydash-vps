import { createServer } from 'http';
import type { AppConfig } from '@mydash/shared';
import type { Logger } from '../logging/index.js';
import type { ModuleRegistry, ModuleStatus } from '../modules/index.js';
import { createLogger } from '../logging/index.js';
import { loadConfig } from '../configuration/index.js';
import { createModuleRegistry } from '../modules/index.js';
import { createLifecycle } from './lifecycle.js';
export interface Application {
  logger: Logger;
  config: AppConfig;
  moduleRegistry: ModuleRegistry;
  start(): Promise<void>;
  stop(): Promise<void>;
}
export function createApplication(): Application {
  const config = loadConfig();
  const logger = createLogger('system', config.system.logLevel);
  const moduleRegistry = createModuleRegistry(logger, config);
  const httpServer = createServer();
  const lifecycle = createLifecycle({
    logger,
    moduleRegistry,
    httpServer,
  });
  return {
    logger,
    config,
    moduleRegistry,
    start: async () => {
      moduleRegistry.register({
        name: 'http-server',
        dependsOn: [],
        initialize: async () => {  },
        shutdown: async () => {
          await new Promise<void>((resolve) => httpServer.close(() => { resolve(); }));
        },
        healthCheck: () => Promise.resolve(true),
        status: 0 as unknown as ModuleStatus,
      });
      await lifecycle.startup();
    },
    stop: async () => { await lifecycle.shutdown(); }
  };
}
