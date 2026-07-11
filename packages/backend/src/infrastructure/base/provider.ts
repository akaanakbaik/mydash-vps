import type { Provider, ProviderHealth } from '@mydash/shared';
import type { Logger } from '../../logging/index.js';
export abstract class BaseProvider<TConfig = Record<string, unknown>> implements Provider<TConfig> {
  protected readonly logger: Logger;
  abstract readonly name: string;
  abstract readonly version: string;
  constructor(logger: Logger) {
    this.logger = logger;
  }
  abstract initialize(config: TConfig): Promise<void>;
  abstract healthCheck(): Promise<ProviderHealth>;
  abstract shutdown(): Promise<void>;
}
