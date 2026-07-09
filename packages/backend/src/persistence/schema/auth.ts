import { pgTable, uuid, varchar, text, boolean } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  userId: uuid('user_id').notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  device: varchar('device', { length: 200 }),
  browser: varchar('browser', { length: 200 }),
  isTrusted: boolean('is_trusted').notNull().default(false),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
  lastActivity: text('last_activity'),
});
