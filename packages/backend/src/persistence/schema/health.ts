import { pgTable, uuid, varchar, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { workspaceId, serverId } from './base.js';

export const healthScores = pgTable('health_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId,
  serverId,
  overallScore: integer('overall_score').notNull(),
  grade: varchar('grade', { length: 10 }).notNull(),
  domainScores: jsonb('domain_scores').notNull(),
  factors: jsonb('factors'),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow().notNull(),
});
