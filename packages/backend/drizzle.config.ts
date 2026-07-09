import type { Config } from 'drizzle-kit';

function getDbCredentials() {
  // Prefer DATABASE_URL for single-source-of-truth config
  const url = process.env['DATABASE_URL'];
  if (url) {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: Number(parsed.port || '5432'),
        database: parsed.pathname.replace(/^\//, ''),
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
      };
    } catch {
      // Fall through to individual env vars
    }
  }

  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '5432'),
    database: process.env.DB_NAME ?? 'mydash',
    user: process.env.DB_USER ?? 'mydash',
    password: process.env.DB_PASSWORD ?? '',
  };
}

export default {
  schema: './src/persistence/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: getDbCredentials(),
} satisfies Config;
