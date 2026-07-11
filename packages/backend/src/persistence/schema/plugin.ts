import { pgTable, varchar, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';
export const plugins = pgTable('plugins', {
  ...baseColumns,
  name: varchar('name', { length: 200 }).notNull(),
  version: varchar('version', { length: 50 }).notNull(),
  author: varchar('author', { length: 200 }),
  description: text('description'),
  capabilities: jsonb('capabilities').notNull(),
  permissions: jsonb('permissions').notNull(),
  enabled: boolean('enabled').notNull().default(false),
  config: jsonb('config'),
  installedAt: timestamp('installed_at', { withTimezone: true }),
});
