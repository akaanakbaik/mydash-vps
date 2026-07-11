import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';
export interface BackupSummary {
  totalBackups: number;
  fullBackups: number;
  incrementalBackups: number;
  differentialBackups: number;
  totalSize: number;
  storageUsed: number;
  storageTotal: number;
  lastBackup: string;
  nextScheduled: string;
  successRate: number;
}
export interface BackupRecord {
  id: number;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  size: number;
  startedAt: string;
  completedAt: string | null;
  duration: number;
  location: string;
  checksum: string;
  retentionDays: number;
}
export interface RetentionPolicy {
  enabled: boolean;
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  keepAll: boolean;
}
export interface RestoreRecord {
  id: number;
  backupName: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  duration: number;
  target: string;
  reason: string;
}
export interface BackupTimelinePoint {
  timestamp: string;
  full: number;
  incremental: number;
  differential: number;
  failed: number;
}
export interface BackupActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: string;
}
export interface BackupResponse {
  summary: BackupSummary;
  backups: BackupRecord[];
  retention: RetentionPolicy;
  restores: RestoreRecord[];
  timeline: BackupTimelinePoint[];
  activity: BackupActivity[];
  filterTypes: { id: string; label: string }[];
}
export const backupRepository = {
  getSummary: () =>
    apiClient.get<BackupResponse>('/backup'),
  getHistory: (params?: PaginationParams) =>
    apiClient.get<BackupRecord[]>('/backup/history', { params: params as Record<string, string | number | boolean | undefined> }),
  triggerBackup: (type: string) =>
    apiClient.post<BackupRecord>('/backup/trigger', { type }),
  restore: (backupId: number) =>
    apiClient.post<RestoreRecord>('/backup/restore', { backupId }),
};
