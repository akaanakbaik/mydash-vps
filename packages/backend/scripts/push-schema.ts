import pg from 'pg';
async function main() {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }
  try {
    const parsed = new URL(url);
    const pool = new pg.Pool({
      host: parsed.hostname,
      port: Number(parsed.port || '5432'),
      database: parsed.pathname.replace(/^\
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
    });
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').catch(() => {});
    console.log('Extensions enabled');
    const statements = [
      `CREATE TABLE IF NOT EXISTS workspaces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        name VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(200) NOT NULL,
        timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
        language VARCHAR(10) NOT NULL DEFAULT 'en',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(200),
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        last_login_at TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS servers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        name VARCHAR(100) NOT NULL,
        hostname VARCHAR(255) NOT NULL,
        display_name VARCHAR(200),
        status VARCHAR(50) NOT NULL DEFAULT 'offline',
        last_heartbeat TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        user_id UUID NOT NULL,
        token VARCHAR(500) NOT NULL UNIQUE,
        ip_address VARCHAR(45),
        device VARCHAR(200),
        browser VARCHAR(200),
        is_trusted BOOLEAN NOT NULL DEFAULT false,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_activity TEXT,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
    ];
    for (const sql of statements) {
      await client.query(sql);
      console.log('Table created');
    }
    const extraTables = [
      `CREATE TABLE IF NOT EXISTS health_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        overall_score INTEGER NOT NULL DEFAULT 100,
        cpu_score INTEGER NOT NULL DEFAULT 100,
        memory_score INTEGER NOT NULL DEFAULT 100,
        disk_score INTEGER NOT NULL DEFAULT 100,
        network_score INTEGER NOT NULL DEFAULT 100,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        server_id UUID,
        name VARCHAR(100) NOT NULL,
        value DOUBLE PRECISION NOT NULL,
        unit VARCHAR(50),
        tags JSONB DEFAULT '{}',
        timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        period VARCHAR(20) NOT NULL,
        summary JSONB DEFAULT '{}',
        computed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS automations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        trigger_type VARCHAR(50) NOT NULL,
        trigger_config JSONB DEFAULT '{}',
        conditions JSONB DEFAULT '[]',
        actions JSONB DEFAULT '[]',
        enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS backups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        name VARCHAR(200) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        config JSONB DEFAULT '{}',
        size_bytes BIGINT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        user_id UUID,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100),
        resource_id VARCHAR(100),
        details JSONB DEFAULT '{}',
        ip_address VARCHAR(45),
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS security_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'info',
        source VARCHAR(100),
        details JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        version INTEGER DEFAULT 1 NOT NULL
      )`,
    ];
    for (const sql of extraTables) {
      await client.query(sql);
    }
    console.log('All tables created successfully');
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Failed to create tables:', err);
    process.exit(1);
  }
}
void main();
