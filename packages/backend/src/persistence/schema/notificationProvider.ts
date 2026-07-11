import { pgTable, uuid, varchar, boolean, text, timestamp } from 'drizzle-orm/pg-core';
export const notificationProviders = pgTable('notification_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().default('00000000-0000-0000-0000-000000000000'),
  provider: varchar('provider', { length: 50 }).notNull().unique(), 
  enabled: boolean('enabled').notNull().default(false),
  token: text('token'),         
  chatId: text('chat_id'),      
  phoneNumber: text('phone_number'), 
  paired: boolean('paired').default(false),
  config: text('config'),       
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
