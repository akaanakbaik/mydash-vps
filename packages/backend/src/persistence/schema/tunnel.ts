import { pgTable, uuid, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';
export const tunnelConfigs = pgTable('tunnel_configs', {
  ...baseColumns,
  serverId: uuid('server_id').notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  port: varchar('port', { length: 10 }).notNull(),
  sslEnabled: boolean('ssl_enabled').notNull().default(true),
  autoReconnect: boolean('auto_reconnect').notNull().default(true),
  status: varchar('status', { length: 50 }).notNull().default('disconnected'),
  lastConnectedAt: timestamp('last_connected_at', { withTimezone: true }),
  reconnectCount: integer('reconnect_count').default(0),
});
