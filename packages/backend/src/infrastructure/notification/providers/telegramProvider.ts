import type { NotificationProviderAdapter } from '../../../domain/notification/services.js';
import type { DeliveryResult } from '../../../domain/notification/services.js';
import { NotificationProvider } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';

export class TelegramNotificationProvider implements NotificationProviderAdapter {
  public readonly providerType = NotificationProvider.Telegram;
  public isAvailable = false;
  private botToken: string | null = null;
  private chatId: string | null = null;

  constructor(private readonly logger: Logger) {}

  configure(botToken: string, chatId: string): void {
    this.botToken = botToken;
    this.chatId = chatId;
    this.isAvailable = true;
  }

  async send(_recipient: string, message: string): Promise<DeliveryResult> {
    if (!this.botToken || !this.chatId) {
      return {
        success: false,
        providerMessageId: null,
        errorCode: 'TELEGRAM_NOT_CONFIGURED',
        errorMessage: 'Bot token or chat ID not configured',
        latencyMs: 0,
      };
    }

    const startTime = Date.now();
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: this.chatId, text: message, parse_mode: 'HTML' }),
      });

      const data = await response.json() as { ok: boolean; result?: { message_id: number }; description?: string };
      const latencyMs = Date.now() - startTime;

      if (data.ok && data.result) {
        return {
          success: true,
          providerMessageId: String(data.result.message_id),
          errorCode: null,
          errorMessage: null,
          latencyMs,
        };
      }

      return {
        success: false,
        providerMessageId: null,
        errorCode: 'TELEGRAM_API_ERROR',
        errorMessage: data.description ?? 'Unknown Telegram error',
        latencyMs,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('telegram send failed', error);
      return {
        success: false,
        providerMessageId: null,
        errorCode: 'TELEGRAM_NETWORK_ERROR',
        errorMessage: error.message,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  healthCheck(): Promise<boolean> {
    return Promise.resolve(this.isAvailable && !!this.botToken);
  }
}
