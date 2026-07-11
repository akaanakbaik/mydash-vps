import type { ServiceContainer } from '../infrastructure/utilities.js';
import { InMemoryCommandBus } from './mediator/commandBus.js';
import { InMemoryQueryBus } from './mediator/queryBus.js';
import { ServiceRegistry } from './registry/serviceRegistry.js';
import { registerUseCases } from '../di/compositionRoot.js';
import type { Logger } from '../logging/index.js';
export function registerApplication(container: ServiceContainer, logger: Logger): void {
  container.register('commandBus', () => new InMemoryCommandBus(logger));
  container.register('queryBus', () => new InMemoryQueryBus(logger));
  container.register('serviceRegistry', () => new ServiceRegistry(container));
  registerUseCases(container, logger);
}
