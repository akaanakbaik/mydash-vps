import { pgTable, uuid, varchar, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';
export const securityEvents = pgTable('security_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});
export const configurations = pgTable('configurations', {
  ...baseColumns,
  key: varchar('key', { length: 200 }).notNull(),
  value: jsonb('value').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
});
export const systemHealth = pgTable('system_health', {
  id: uuid('id').primaryKey().defaultRandom(),
  uptime: integer('uptime').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  checks: jsonb('checks').notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
});
