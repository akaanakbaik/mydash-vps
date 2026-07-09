import type { NotificationProviderAdapter } from '../../../domain/notification/services.js';
import type { DeliveryResult } from '../../../domain/notification/services.js';
import { NotificationProvider } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';

export class WhatsAppNotificationProvider implements NotificationProviderAdapter {
  public readonly providerType = NotificationProvider.WhatsApp;
  public isAvailable = false;
  private ownerNumber: string | null = null;
  private isConnected = false;

  constructor(private readonly logger: Logger) {}

  configure(ownerNumber: string): void {
    this.ownerNumber = ownerNumber;
    this.isAvailable = true;
    this.isConnected = true;
    this.logger.info('whatsapp provider configured', { ownerNumber: ownerNumber.slice(-4) });
  }

  send(_recipient: string, _message: string): Promise<DeliveryResult> {
    if (!this.isConnected || !this.ownerNumber) {
      return Promise.resolve({
        success: false,
        providerMessageId: null,
        errorCode: 'WHATSAPP_NOT_CONNECTED',
        errorMessage: 'WhatsApp provider not connected',
        latencyMs: 0,
      });
    }

    const startTime = Date.now();
    try {
      this.logger.debug('sending whatsapp message');
      return Promise.resolve({
        success: true,
        providerMessageId: crypto.randomUUID(),
        errorCode: null,
        errorMessage: null,
        latencyMs: Date.now() - startTime,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('whatsapp send failed', error);
      return Promise.resolve({
        success: false,
        providerMessageId: null,
        errorCode: 'WHATSAPP_SEND_ERROR',
        errorMessage: error.message,
        latencyMs: Date.now() - startTime,
      });
    }
  }

  healthCheck(): Promise<boolean> {
    return Promise.resolve(this.isAvailable && this.isConnected);
  }
}
