import type { NotificationRateLimiter } from '../../domain/notification/services.js';
import type { NotificationProvider } from '@mydash/shared';
export class NotificationRateLimiterImpl implements NotificationRateLimiter {
  private readonly limits = new Map<NotificationProvider, { count: number; resetAt: number }>();
  canSend(provider: NotificationProvider): boolean {
    const now = Date.now();
    const entry = this.limits.get(provider);
    if (!entry) return true;
    if (now > entry.resetAt) {
      this.limits.delete(provider);
      return true;
    }
    return entry.count < 30;
  }
  recordSend(provider: NotificationProvider): void {
    const now = Date.now();
    const entry = this.limits.get(provider);
    if (!entry || now > entry.resetAt) {
      this.limits.set(provider, { count: 1, resetAt: now + 1000 });
    } else {
      entry.count += 1;
    }
  }
}
