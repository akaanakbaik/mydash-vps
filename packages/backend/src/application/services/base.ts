import type { Logger } from '../../logging/index.js';
import type { ServiceContainer } from '../../infrastructure/utilities.js';
import { BaseService } from '../../infrastructure/base/service.js';
export abstract class ApplicationService extends BaseService {
  protected readonly container: ServiceContainer;
  constructor(logger: Logger, container: ServiceContainer) {
    super(logger);
    this.container = container;
  }
  protected resolve(key: string): unknown {
    return this.container.resolve(key);
  }
}
