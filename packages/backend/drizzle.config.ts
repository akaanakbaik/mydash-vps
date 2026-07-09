import type { Config } from 'drizzle-kit';

export default {
  schema: './src/persistence/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '5432'),
    database: process.env.DB_NAME ?? 'mydash',
    user: process.env.DB_USER ?? 'mydash',
    password: process.env.DB_PASSWORD ?? '',
  },
} satisfies Config;
