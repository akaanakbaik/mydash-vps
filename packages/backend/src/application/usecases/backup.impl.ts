import type { Result, AppError } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { BackupRepository } from '../../domain/backup/index.js';
import type { Logger } from '../../logging/index.js';
const createBackupMetadata: UseCaseMetadata = {
  name: 'CreateBackup',
  description: 'Create a new backup',
  category: 'Backup',
  requiresAuth: true,
  idempotent: false,
  timeoutMs: 30000,
};
export class CreateBackupUseCaseImpl implements UseCase<{ serverId: string; mode: string }, unknown> {
  public readonly metadata = createBackupMetadata;
  constructor(
    private readonly repository: BackupRepository,
    private readonly logger: Logger,
  ) {}
  async execute(input: { serverId: string; mode: string }, context: UseCaseContext): Promise<Result<unknown, AppError>> {
    try {
      const record = {
        id: crypto.randomUUID(),
        workspaceId: context.workspaceId,
        serverId: input.serverId,
        configId: crypto.randomUUID(),
        mode: input.mode as import('@mydash/shared').BackupMode,
        status: 'running' as const,
        sizeBytes: 0,
        compressionRatio: 1,
        encryptionEnabled: false,
        checksum: '',
        storagePath: '',
        durationMs: 0,
        errorDetails: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      await this.repository.saveRecord(record as import('../../domain/backup/index.js').BackupRecord);
      this.logger.info('backup created', {
        backupId: record.id,
        serverId: input.serverId,
        correlationId: context.correlationId,
      });
      return { success: true, data: record, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('backup creation failed', error, { correlationId: context.correlationId });
      return { success: false, data: null, error: { name: error.message, message: error.message, code: 'BACKUP_CREATE_FAILED' } as AppError };
    }
  }
}
const listBackupsMetadata: UseCaseMetadata = {
  name: 'ListBackups',
  description: 'List backups for a workspace',
  category: 'Backup',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 5000,
};
export class ListBackupsUseCaseImpl implements UseCase<string, unknown[]> {
  public readonly metadata = listBackupsMetadata;
  constructor(
    private readonly repository: BackupRepository,
  ) {}
  async execute(workspaceId: string, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    try {
      const records = await this.repository.findByWorkspaceId(workspaceId);
      return { success: true, data: records, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'BACKUP_LIST_FAILED' } as AppError };
    }
  }
}
const restoreBackupMetadata: UseCaseMetadata = {
  name: 'RestoreBackup',
  description: 'Restore from a backup',
  category: 'Backup',
  requiresAuth: true,
  idempotent: false,
  timeoutMs: 60000,
};
export class RestoreBackupUseCaseImpl implements UseCase<string, unknown> {
  public readonly metadata = restoreBackupMetadata;
  constructor(
    private readonly repository: BackupRepository,
    private readonly logger: Logger,
  ) {}
  async execute(backupId: string, context: UseCaseContext): Promise<Result<unknown, AppError>> {
    try {
      const record = await this.repository.findById(backupId);
      if (!record) {
        return { success: false, data: null, error: { name: 'NotFound', message: 'Backup record not found', code: 'BACKUP_NOT_FOUND' } as AppError };
      }
      const result = {
        id: crypto.randomUUID(),
        backupId,
        status: 'restoring' as const,
        startedAt: new Date().toISOString(),
        workspaceId: context.workspaceId,
      };
      this.logger.info('backup restore initiated', { backupId, correlationId: context.correlationId });
      return { success: true, data: result, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('backup restore failed', error, { correlationId: context.correlationId });
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'BACKUP_RESTORE_FAILED' } as AppError };
    }
  }
}
