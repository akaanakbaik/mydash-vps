import type { ServiceContainer } from '../../infrastructure/utilities.js';
export class ServiceRegistry {
  private readonly container: ServiceContainer;
  constructor(container: ServiceContainer) {
    this.container = container;
  }
  register(key: string, factory: (container: ServiceContainer) => unknown): void {
    this.container.register(key, factory);
  }
  resolve(key: string): unknown {
    return this.container.resolve(key);
  }
}
