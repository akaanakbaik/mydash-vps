import { pgTable, varchar, text, boolean } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';
export const workspaces = pgTable('workspaces', {
  ...baseColumns,
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 200 }).notNull(),
  timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  isActive: boolean('is_active').notNull().default(true),
});
export const users = pgTable('users', {
  ...baseColumns,
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 200 }),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  lastLoginAt: text('last_login_at'),
});
export const servers = pgTable('servers', {
  ...baseColumns,
  name: varchar('name', { length: 100 }).notNull(),
  hostname: varchar('hostname', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 200 }),
  status: varchar('status', { length: 50 }).notNull().default('offline'),
  lastHeartbeat: text('last_heartbeat'),
});
