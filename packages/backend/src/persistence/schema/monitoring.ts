import { pgTable, uuid, varchar, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { workspaceId, serverId } from './base.js';
export const metrics = pgTable('metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId,
  serverId,
  metricType: varchar('metric_type', { length: 50 }).notNull(),
  data: jsonb('data').notNull(),
  correlationId: varchar('correlation_id', { length: 100 }).notNull(),
  version: integer('version').default(1).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
});
