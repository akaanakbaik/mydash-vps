import { pgTable, uuid, varchar, text, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { baseColumns, serverId } from './base.js';

export const automations = pgTable('automations', {
  ...baseColumns,
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(true),
  triggerType: varchar('trigger_type', { length: 50 }).notNull(),
  eventCategory: varchar('event_category', { length: 100 }),
  scheduleCron: varchar('schedule_cron', { length: 100 }),
  conditions: jsonb('conditions').notNull(),
  actions: jsonb('actions').notNull(),
  cooldownSeconds: integer('cooldown_seconds').notNull(),
  maxRetry: integer('max_retry').notNull(),
  requiresApproval: boolean('requires_approval').notNull().default(false),
});

export const automationExecutions = pgTable('automation_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  serverId,
  automationId: uuid('automation_id').notNull(),
  triggerEvent: jsonb('trigger_event'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  priority: varchar('priority', { length: 50 }).notNull(),
  retryCount: integer('retry_count').default(0),
  maxRetry: integer('max_retry').default(3),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  durationMs: integer('duration_ms'),
  result: text('result'),
  errorDetails: text('error_details'),
  correlationId: varchar('correlation_id', { length: 100 }).notNull(),
  createdAt: text('created_at').notNull(),
});
