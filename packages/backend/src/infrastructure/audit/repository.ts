import { eq, desc } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { auditRecords } from '../../persistence/schema/audit.js';
import type { AuditRepository } from '../../domain/audit/index.js';
import type { AuditRecord } from '@mydash/shared';
export class AuditRepositoryImpl implements AuditRepository {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }
  async save(record: AuditRecord): Promise<void> {
    await this.db.insert(auditRecords).values({
      id: record.id,
      workspaceId: record.workspaceId,
      actorId: record.userId,
      actorType: 'user',
      action: record.action,
      entityType: record.module,
      entityId: record.targetResource,
      oldValue: record.previousState,
      newValue: record.newState,
      ipAddress: record.ipAddress,
      correlationId: record.correlationId,
    });
  }
  async findById(id: string): Promise<AuditRecord | null> {
    const rows = await this.db.select().from(auditRecords).where(eq(auditRecords.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as AuditRecord;
  }
  async findByWorkspaceId(workspaceId: string, limit = 50): Promise<AuditRecord[]> {
    const rows = await this.db.select()
      .from(auditRecords)
      .where(eq(auditRecords.workspaceId, workspaceId))
      .orderBy(desc(auditRecords.createdAt))
      .limit(limit);
    return rows as unknown as AuditRecord[];
  }
  async findByCorrelationId(correlationId: string): Promise<AuditRecord[]> {
    const rows = await this.db.select()
      .from(auditRecords)
      .where(eq(auditRecords.correlationId, correlationId))
      .orderBy(desc(auditRecords.createdAt));
    return rows as unknown as AuditRecord[];
  }
}
