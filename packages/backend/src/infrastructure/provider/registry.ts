import type { Provider } from '@mydash/shared';

export interface ProviderRegistry {
  register(name: string, provider: Provider): void;
  resolve(name: string): Provider | undefined;
  healthCheckAll(): Promise<Map<string, boolean>>;
  shutdownAll(): Promise<void>;
  getRegisteredNames(): string[];
}

export { type Provider };
