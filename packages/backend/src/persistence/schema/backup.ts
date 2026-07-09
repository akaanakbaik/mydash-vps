import { pgTable, uuid, varchar, integer, boolean, text, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns, serverId } from './base.js';

export const backupConfigs = pgTable('backup_configs', {
  ...baseColumns,
  serverId,
  enabled: boolean('enabled').notNull().default(true),
  schedule: varchar('schedule', { length: 50 }).notNull(),
  mode: varchar('mode', { length: 50 }).notNull(),
  retentionDays: integer('retention_days').notNull(),
  maxBackups: integer('max_backups').notNull(),
  compressionEnabled: boolean('compression_enabled').notNull().default(true),
  encryptionEnabled: boolean('encryption_enabled').notNull().default(false),
  storagePath: varchar('storage_path', { length: 500 }).notNull(),
});

export const backupRecords = pgTable('backup_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  serverId,
  configId: uuid('config_id').notNull(),
  mode: varchar('mode', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  sizeBytes: integer('size_bytes'),
  storagePath: varchar('storage_path', { length: 500 }),
  durationMs: integer('duration_ms'),
  errorDetails: text('error_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const restoreRecords = pgTable('restore_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  serverId,
  backupId: uuid('backup_id').notNull(),
  mode: varchar('mode', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  components: text('components'),
  durationMs: integer('duration_ms'),
  isRollback: boolean('is_rollback').notNull().default(false),
  errorDetails: text('error_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
