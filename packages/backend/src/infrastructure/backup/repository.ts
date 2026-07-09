import { eq } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { backupConfigs, backupRecords } from '../../persistence/schema/backup.js';
import type { BackupRepository } from '../../domain/backup/index.js';
import type { BackupConfig, BackupRecord } from '@mydash/shared';

type BackupConfigInsert = InferInsertModel<typeof backupConfigs>;
type BackupRecordInsert = InferInsertModel<typeof backupRecords>;

export class BackupRepositoryImpl implements BackupRepository {
  constructor(private readonly db: DrizzleClient) {
    this.db = makeTransactionalDb(this.db);
  }

  async saveConfig(config: BackupConfig): Promise<void> {
    const values: BackupConfigInsert = {
      id: config.id,
      workspaceId: config.workspaceId,
      serverId: config.serverId,
      enabled: config.enabled,
      schedule: config.schedule,
      mode: config.mode,
      retentionDays: config.retentionDays,
      maxBackups: config.maxBackups,
      compressionEnabled: true,
      encryptionEnabled: false,
      storagePath: config.storagePath,
    };
    await this.db.insert(backupConfigs).values(values).onConflictDoUpdate({
      target: backupConfigs.id,
      set: { enabled: config.enabled },
    });
  }

  async getConfig(workspaceId: string): Promise<BackupConfig | null> {
    const rows = await this.db.select().from(backupConfigs).where(eq(backupConfigs.workspaceId, workspaceId)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as BackupConfig;
  }

  async saveRecord(record: BackupRecord): Promise<void> {
    const values: BackupRecordInsert = {
      id: record.id,
      workspaceId: record.workspaceId,
      serverId: record.serverId,
      configId: record.configId,
      mode: record.mode,
      status: record.status,
      sizeBytes: record.sizeBytes,
      storagePath: record.storagePath,
      durationMs: record.durationMs,
      errorDetails: null,
      createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
      completedAt: record.completedAt ? new Date(record.completedAt) : null,
    };
    await this.db.insert(backupRecords).values(values).onConflictDoUpdate({
      target: backupRecords.id,
      set: { status: record.status },
    });
  }

  async findById(id: string): Promise<BackupRecord | null> {
    const rows = await this.db.select().from(backupRecords).where(eq(backupRecords.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as BackupRecord;
  }

  async findByWorkspaceId(workspaceId: string): Promise<BackupRecord[]> {
    const rows = await this.db.select().from(backupRecords).where(eq(backupRecords.workspaceId, workspaceId)).orderBy(backupRecords.createdAt);
    return rows.map((r) => r as unknown as BackupRecord);
  }
}
