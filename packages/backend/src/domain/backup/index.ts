import type { BackupConfig, BackupRecord } from '@mydash/shared';

export type { BackupConfig, BackupRecord } from '@mydash/shared';
export { BackupMode, BackupStatus } from '@mydash/shared';

export interface BackupRepository {
  saveConfig(config: BackupConfig): Promise<void>;
  getConfig(workspaceId: string): Promise<BackupConfig | null>;
  saveRecord(record: BackupRecord): Promise<void>;
  findById(id: string): Promise<BackupRecord | null>;
  findByWorkspaceId(workspaceId: string): Promise<BackupRecord[]>;
}
