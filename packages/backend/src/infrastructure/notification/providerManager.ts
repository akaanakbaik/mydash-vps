import type { NotificationProviderManager, NotificationProviderAdapter, DeliveryResult } from '../../domain/notification/services.js';
import type { NotificationProvider } from '@mydash/shared';
import type { Logger } from '../../logging/index.js';

export class NotificationProviderManagerImpl implements NotificationProviderManager {
  private readonly providers = new Map<NotificationProvider, NotificationProviderAdapter>();

  constructor(private readonly logger: Logger) {}

  register(provider: NotificationProviderAdapter): void {
    this.providers.set(provider.providerType, provider);
    this.logger.info('notification provider registered', { providerType: provider.providerType });
  }

  async send(provider: NotificationProvider, recipient: string, message: string): Promise<DeliveryResult> {
    const adapter = this.providers.get(provider);
    if (!adapter) {
      return {
        success: false,
        providerMessageId: null,
        errorCode: 'PROVIDER_NOT_FOUND',
        errorMessage: `Provider ${provider} not registered`,
        latencyMs: 0,
      };
    }

    if (!adapter.isAvailable) {
      return {
        success: false,
        providerMessageId: null,
        errorCode: 'PROVIDER_UNAVAILABLE',
        errorMessage: `Provider ${provider} is not available`,
        latencyMs: 0,
      };
    }

    return adapter.send(recipient, message);
  }

  getAvailableProviders(): NotificationProvider[] {
    return Array.from(this.providers.entries())
      .filter(([, adapter]) => adapter.isAvailable)
      .map(([type]) => type);
  }

  async healthCheck(provider: NotificationProvider): Promise<boolean> {
    const adapter = this.providers.get(provider);
    if (!adapter) return false;
    return adapter.healthCheck();
  }
}
