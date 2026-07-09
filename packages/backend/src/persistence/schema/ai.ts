import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';

export const aiRequests = pgTable('ai_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  prompt: text('prompt').notNull(),
  context: jsonb('context'),
  response: text('response'),
  tokensUsed: varchar('tokens_used', { length: 50 }),
  durationMs: varchar('duration_ms', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  correlationId: varchar('correlation_id', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const authorizationRoles = pgTable('authorization_roles', {
  ...baseColumns,
  name: varchar('name', { length: 100 }).notNull(),
  permissions: jsonb('permissions').notNull(),
  isSystem: varchar('is_system', { length: 5 }).notNull().default('false'),
});
