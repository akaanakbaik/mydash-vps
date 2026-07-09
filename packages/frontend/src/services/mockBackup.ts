// Mock backup data provider — replace with real Backup Engine later.
export interface BackupSummary { totalBackups: number; fullBackups: number; incrementalBackups: number; differentialBackups: number; totalSize: number; storageUsed: number; storageTotal: number; lastBackup: string; nextScheduled: string; successRate: number; }
export interface BackupRecord { id: number; name: string; type: 'full' | 'incremental' | 'differential'; status: 'running' | 'completed' | 'failed' | 'scheduled'; size: number; startedAt: string; completedAt: string | null; duration: number; location: string; checksum: string; retentionDays: number; }
export interface RetentionPolicy { enabled: boolean; daily: number; weekly: number; monthly: number; yearly: number; keepAll: boolean; }
export interface RestoreRecord { id: number; backupName: string; status: 'running' | 'completed' | 'failed'; startedAt: string; completedAt: string | null; duration: number; target: string; reason: string; }
export interface BackupTimelinePoint { timestamp: string; full: number; incremental: number; differential: number; failed: number; }
export interface BackupActivity { id: string; type: string; message: string; timestamp: string; severity: string; }
export interface BackupData { summary: BackupSummary; backups: BackupRecord[]; retention: RetentionPolicy; restores: RestoreRecord[]; timeline: BackupTimelinePoint[]; activity: BackupActivity[]; filterTypes: { id: string; label: string }[]; }
function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }
export function getMockBackupData(): BackupData { return {
  summary: { totalBackups: 342, fullBackups: 52, incrementalBackups: 210, differentialBackups: 80, totalSize: 245760, storageUsed: 153600, storageTotal: 512000, lastBackup: minutesAgo(120), nextScheduled: minutesAgo(-3600), successRate: 97.4 },
  backups: [
    { id: 1, name: 'Full System Backup', type: 'full', status: 'completed', size: 25600, startedAt: minutesAgo(1440), completedAt: minutesAgo(1380), duration: 3600, location: '/mnt/backup/full/', checksum: 'sha256:a1b2c3...', retentionDays: 90 },
    { id: 2, name: 'Daily Incremental', type: 'incremental', status: 'completed', size: 1280, startedAt: minutesAgo(120), completedAt: minutesAgo(118), duration: 120, location: '/mnt/backup/inc/', checksum: 'sha256:d4e5f6...', retentionDays: 30 },
    { id: 3, name: 'Weekly Differential', type: 'differential', status: 'completed', size: 5120, startedAt: minutesAgo(5760), completedAt: minutesAgo(5740), duration: 1200, location: '/mnt/backup/diff/', checksum: 'sha256:g7h8i9...', retentionDays: 60 },
    { id: 4, name: 'Full Database Dump', type: 'full', status: 'running', size: 0, startedAt: minutesAgo(5), completedAt: null, duration: 0, location: '/mnt/backup/full/', checksum: '', retentionDays: 90 },
    { id: 5, name: 'Nightly Incremental', type: 'incremental', status: 'failed', size: 512, startedAt: minutesAgo(720), completedAt: minutesAgo(718), duration: 90, location: '/mnt/backup/inc/', checksum: 'sha256:j0k1l2...', retentionDays: 30 },
    { id: 6, name: 'Monthly Differential', type: 'differential', status: 'scheduled', size: 0, startedAt: minutesAgo(-43200), completedAt: null, duration: 0, location: '/mnt/backup/diff/', checksum: '', retentionDays: 365 },
  ],
  retention: { enabled: true, daily: 7, weekly: 4, monthly: 12, yearly: 3, keepAll: false },
  restores: [
    { id: 1, backupName: 'Full System Backup', status: 'completed', startedAt: minutesAgo(10080), completedAt: minutesAgo(10020), duration: 3600, target: '/restore/latest/', reason: 'System corruption recovery' },
    { id: 2, backupName: 'Daily Incremental', status: 'completed', startedAt: minutesAgo(43200), completedAt: minutesAgo(43198), duration: 120, target: '/restore/inc/', reason: 'Accidental file deletion' },
    { id: 3, backupName: 'Full Database Dump', status: 'failed', startedAt: minutesAgo(86400), completedAt: minutesAgo(86390), duration: 600, target: '/restore/db/', reason: 'Data migration rollback' },
  ],
  timeline: Array.from({ length: 24 }).map((_, i) => ({ timestamp: minutesAgo(24 - i), full: i % 24 === 0 ? 1 : 0, incremental: Math.round(Math.random() * 3), differential: i % 12 === 0 ? 1 : 0, failed: Math.random() > 0.8 ? 1 : 0 })),
  activity: [
    { id: 'a1', type: 'backup', message: 'Daily incremental backup completed (1.2 GB)', timestamp: minutesAgo(118), severity: 'success' },
    { id: 'a2', type: 'backup', message: 'Full database dump started', timestamp: minutesAgo(5), severity: 'info' },
    { id: 'a3', type: 'failure', message: 'Nightly incremental backup failed — disk full', timestamp: minutesAgo(718), severity: 'error' },
    { id: 'a4', type: 'restore', message: 'System restore completed successfully', timestamp: minutesAgo(10020), severity: 'success' },
    { id: 'a5', type: 'schedule', message: 'Weekly differential backup scheduled', timestamp: minutesAgo(60), severity: 'info' },
  ],
  filterTypes: [{ id: 'all', label: 'All Types' }, { id: 'full', label: 'Full' }, { id: 'incremental', label: 'Incremental' }, { id: 'differential', label: 'Differential' }],
}; }
