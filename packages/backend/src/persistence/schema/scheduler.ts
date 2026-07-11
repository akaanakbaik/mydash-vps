import { pgTable, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';
export const schedulerTasks = pgTable('scheduler_tasks', {
  ...baseColumns,
  name: varchar('name', { length: 200 }).notNull(),
  scheduleType: varchar('schedule_type', { length: 50 }).notNull(),
  cronExpression: varchar('cron_expression', { length: 100 }),
  intervalMs: integer('interval_ms'),
  command: text('command'),
  enabled: boolean('enabled').notNull().default(true),
  status: varchar('status', { length: 50 }).notNull().default('idle'),
  lastExecutedAt: timestamp('last_executed_at', { withTimezone: true }),
  nextExecutionAt: timestamp('next_execution_at', { withTimezone: true }),
});
