import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';
export const githubRepos = pgTable('github_repos', {
  ...baseColumns,
  name: varchar('name', { length: 200 }).notNull(),
  fullName: varchar('full_name', { length: 500 }).notNull(),
  url: varchar('url', { length: 500 }),
  defaultBranch: varchar('default_branch', { length: 100 }),
  stars: integer('stars').default(0),
  language: varchar('language', { length: 50 }),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
});
export const githubWorkflows = pgTable('github_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  repositoryId: uuid('repository_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  path: varchar('path', { length: 500 }),
  status: varchar('status', { length: 50 }),
  conclusion: varchar('conclusion', { length: 50 }),
  runId: varchar('run_id', { length: 100 }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
