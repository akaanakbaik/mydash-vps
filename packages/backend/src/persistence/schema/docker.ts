import { pgTable, uuid, varchar, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.js';

export const dockerContainers = pgTable('docker_containers', {
  ...baseColumns,
  serverId: uuid('server_id').notNull(),
  containerId: varchar('container_id', { length: 100 }),
  name: varchar('name', { length: 200 }).notNull(),
  image: varchar('image', { length: 500 }).notNull(),
  status: varchar('status', { length: 50 }),
  healthStatus: varchar('health_status', { length: 50 }),
  ports: jsonb('ports'),
  mounts: jsonb('mounts'),
  restartCount: integer('restart_count').default(0),
  startedAt: timestamp('started_at', { withTimezone: true }),
});

export const dockerComposes = pgTable('docker_composes', {
  ...baseColumns,
  serverId: uuid('server_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  filePath: varchar('file_path', { length: 500 }),
  serviceCount: integer('service_count'),
  status: varchar('status', { length: 50 }),
  lastDeployedAt: timestamp('last_deployed_at', { withTimezone: true }),
});
