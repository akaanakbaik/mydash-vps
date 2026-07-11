import { eq, and, desc } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { securityEvents } from '../../persistence/schema/security.js';
import type { SecurityRepository, SecurityEvent } from '../../domain/security/index.js';
export class SecurityRepositoryImpl implements SecurityRepository {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }
  async saveEvent(event: SecurityEvent): Promise<void> {
    await this.db.insert(securityEvents).values({
      id: event.id,
      workspaceId: event.workspaceId,
      eventType: event.eventType,
      ipAddress: event.ipAddress,
      metadata: event.metadata,
    });
  }
  async findEvents(workspaceId: string, limit = 50): Promise<SecurityEvent[]> {
    const rows = await this.db.select()
      .from(securityEvents)
      .where(eq(securityEvents.workspaceId, workspaceId))
      .orderBy(desc(securityEvents.timestamp))
      .limit(limit);
    return rows.map((r) => ({
      id: r.id,
      workspaceId: r.workspaceId,
      eventType: r.eventType,
      ipAddress: r.ipAddress,
      metadata: r.metadata,
      timestamp: r.timestamp,
    } as SecurityEvent));
  }
  async getFailedLoginCount(workspaceId: string, windowMs: number): Promise<number> {
    const cutoff = new Date(Date.now() - windowMs);
    const rows = await this.db.select()
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.workspaceId, workspaceId),
          eq(securityEvents.eventType, 'loginFailed'),
        ),
      );
    return rows.filter((r) => r.timestamp >= cutoff).length;
  }
}
