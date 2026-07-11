import type { NotificationProviderAdapter } from '../../../domain/notification/services.js';
import type { DeliveryResult } from '../../../domain/notification/services.js';
import { NotificationProvider } from '@mydash/shared';
export class DashboardNotificationProvider implements NotificationProviderAdapter {
  public readonly providerType = NotificationProvider.Dashboard;
  public isAvailable = true;
  send(_recipient: string, _message: string): Promise<DeliveryResult> {
    return Promise.resolve({
      success: true,
      providerMessageId: crypto.randomUUID(),
      errorCode: null,
      errorMessage: null,
      latencyMs: 5,
    });
  }
  healthCheck(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
