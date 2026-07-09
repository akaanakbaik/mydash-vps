import type { NotificationDeduplicator } from '../../domain/notification/services.js';

export class NotificationDeduplicatorImpl implements NotificationDeduplicator {
  private readonly hashes = new Map<string, number>();

  isDuplicate(payloadHash: string, windowMs: number): boolean {
    const now = Date.now();
    const timestamp = this.hashes.get(payloadHash);
    if (!timestamp) return false;
    return now - timestamp < windowMs;
  }

  recordHash(payloadHash: string): void {
    this.hashes.set(payloadHash, Date.now());
    if (this.hashes.size > 10000) {
      const cutoff = Date.now() - 600000;
      for (const [key, ts] of this.hashes) {
        if (ts < cutoff) this.hashes.delete(key);
      }
    }
  }
}
