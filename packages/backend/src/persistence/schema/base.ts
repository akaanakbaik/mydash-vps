import { uuid, timestamp, integer } from 'drizzle-orm/pg-core';
export const id = uuid('id').primaryKey().defaultRandom();
export const workspaceId = uuid('workspace_id').notNull();
export const serverId = uuid('server_id').notNull();
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};
export const softDelete = {
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};
export const version = integer('version').default(1).notNull();
export const baseColumns = {
  id,
  workspaceId,
  ...timestamps,
  ...softDelete,
  version,
};
export const baseColumnsWithoutWorkspace = {
  id,
  ...timestamps,
  ...softDelete,
  version,
};
