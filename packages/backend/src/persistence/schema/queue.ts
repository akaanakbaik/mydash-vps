import { pgTable, uuid, varchar, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';
export const queueJobs = pgTable('queue_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  serverId: uuid('server_id').notNull(),
  jobType: varchar('job_type', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  payload: jsonb('payload').notNull(),
  retryCount: integer('retry_count').default(0),
  maxRetry: integer('max_retry').default(3),
  correlationId: varchar('correlation_id', { length: 100 }).notNull(),
  workerId: varchar('worker_id', { length: 100 }),
  errorDetails: text('error_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
export const rules = pgTable('rules', {
  ...baseColumns,
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(true),
  conditions: jsonb('conditions').notNull(),
  logicOperator: varchar('logic_operator', { length: 10 }).notNull().default('AND'),
  cooldownSeconds: integer('cooldown_seconds').notNull().default(300),
  severity: varchar('severity', { length: 50 }).notNull(),
});
export const analyticsSummaries = pgTable('analytics_summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  serverId: uuid('server_id').notNull(),
  summaryType: varchar('summary_type', { length: 50 }).notNull(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  windowEnd: timestamp('window_end', { withTimezone: true }).notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
