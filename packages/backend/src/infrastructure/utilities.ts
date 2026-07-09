import type { Logger } from '../logging/index.js';

export interface ServiceContainer {
  register(token: string, factory: (container: ServiceContainer) => unknown): void;
  registerSingleton(token: string, factory: (container: ServiceContainer) => unknown): void;
  resolve(token: string): unknown;
  has(token: string): boolean;
}

export function calculateBackoffDelay(attempt: number): number {
  const delays = [0, 5000, 15000, 30000, 60000];
  return attempt < delays.length ? delays[attempt] : 60000;
}

export function createServiceContainer(logger: Logger): ServiceContainer {
  const registrations = new Map<string, { factory: (c: ServiceContainer) => unknown; singleton: boolean }>();
  const instances = new Map<string, unknown>();

  return {
    register(token: string, factory: (container: ServiceContainer) => unknown): void {
      registrations.set(token, { factory, singleton: false });
      logger.debug(`Registered service: ${token}`);
    },

    registerSingleton(token: string, factory: (container: ServiceContainer) => unknown): void {
      registrations.set(token, { factory, singleton: true });
      logger.debug(`Registered singleton: ${token}`);
    },

    resolve(token: string): unknown {
      if (instances.has(token)) {
        return instances.get(token);
      }

      const registration = registrations.get(token);
      if (!registration) {
        throw new Error(`Service not registered: ${token}`);
      }

      const instance = registration.factory(this);
      if (registration.singleton) {
        instances.set(token, instance);
      }

      return instance;
    },

    has(token: string): boolean {
      return registrations.has(token);
    },
  };
}
