import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigurationRepositoryImpl } from './repository.js';

describe('ConfigurationRepositoryImpl', () => {
  let repo: ConfigurationRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    const chain = vi.fn().mockReturnThis();
    const mockDb = {
      select: chain, from: chain, where: vi.fn().mockResolvedValue([]),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn().mockResolvedValue(undefined) }) }),
    } as never;
    repo = new ConfigurationRepositoryImpl(mockDb);
  });

  it('should be defined', () => { expect(repo).toBeDefined(); });
  it('get returns default when empty', async () => {
    const r = await repo.get('ws-1');
    expect(r).toBeDefined();
  });
  it('save succeeds', async () => {
    await repo.save('ws-1', { system: { nodeEnv: 'test', port: 3000, host: 'localhost', timezone: 'UTC', logLevel: 'info', logRetentionDays: 30 }, database: { url: 'pg://localhost', maxConnections: 20, idleTimeoutMs: 30000, migrationEnabled: false }, redis: { url: 'redis://localhost', maxRetries: 3, retryDelayMs: 1000, keyPrefix: 'mydash:' }, authentication: { sessionLifetimeHours: 24, maxLoginAttempts: 5, bruteForceCooldownMs: 60000, passwordMinLength: 12 }, notification: { enabled: true, workerCount: 2, maxRetry: 3, aiTimeoutSeconds: 30, defaultCooldownMs: 600000, rateLimitPerMinute: 60 }, tunnel: { primaryProvider: 'cf', fallbackProvider: 'ngrok', healthCheckIntervalMs: 30000, maxRetry: 3, autoReconnect: true }, ai: { enabled: false, provider: 'openai', model: 'gpt-4', timeoutSeconds: 30, maxTokens: 1024 }, monitoring: { cpuSamplingIntervalMs: 1000, memorySamplingIntervalMs: 2000, diskSamplingIntervalMs: 5000, networkSamplingIntervalMs: 1000, snapshotIntervalMs: 300000 }, security: { rateLimitRequestsPerMinute: 60, corsAllowedOrigins: ['*'], encryptionEnabled: true }, version: 1 });
  });
  it('getDefault returns config', () => { expect(repo.getDefault()).toBeDefined(); });
});
