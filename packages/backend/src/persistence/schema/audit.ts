import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { workspaceId } from './base.js';
export const auditRecords = pgTable('audit_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId,
  actorId: uuid('actor_id'),
  actorType: varchar('actor_type', { length: 50 }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: varchar('ip_address', { length: 45 }),
  correlationId: varchar('correlation_id', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const logEntries = pgTable('log_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId,
  level: varchar('level', { length: 20 }).notNull(),
  module: varchar('module', { length: 100 }).notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  correlationId: varchar('correlation_id', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
