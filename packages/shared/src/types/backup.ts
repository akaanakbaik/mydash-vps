import type { BackupStatus } from '../enums/status.js';
export interface BackupConfig {
  id: string;
  workspaceId: string;
  serverId: string;
  enabled: boolean;
  schedule: string;
  mode: BackupMode;
  retentionDays: number;
  maxBackups: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
}
export enum BackupMode {
  Full = 'full',
  Incremental = 'incremental',
  Differential = 'differential',
  Configuration = 'configuration',
}
export interface BackupRecord {
  id: string;
  workspaceId: string;
  serverId: string;
  configId: string;
  mode: BackupMode;
  status: BackupStatus;
  sizeBytes: number;
  compressionRatio: number;
  encryptionEnabled: boolean;
  checksum: string;
  storagePath: string;
  durationMs: number;
  errorDetails: string | null;
  createdAt: string;
  completedAt: string | null;
}
export interface RestoreRecord {
  id: string;
  workspaceId: string;
  serverId: string;
  backupId: string;
  mode: RestoreMode;
  status: BackupStatus;
  components: string[];
  durationMs: number;
  preRestoreBackupId: string | null;
  isRollback: boolean;
  errorDetails: string | null;
  createdAt: string;
  completedAt: string | null;
}
export enum RestoreMode {
  Full = 'full',
  Configuration = 'configuration',
  Workspace = 'workspace',
  Database = 'database',
  Plugin = 'plugin',
  Selective = 'selective',
}
