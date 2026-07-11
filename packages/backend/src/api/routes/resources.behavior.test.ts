import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServersRouter, createBackupRouter, createDockerRouter, createTunnelRouter, createGitHubRouter, createPluginRouter } from './resources.js';
import { createReq, createRes, mockUseCase, getRoute } from './test-utils.js';
describe('Servers Router', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns empty array without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const router = createServersRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
  it('GET / returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const servers = [{ id: 's1', name: 'web-1' }];
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: servers })) };
    const router = createServersRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
  it('GET / returns empty data on use case failure', async () => {
    const { res, getStatus, getBody } = createRes();
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: false })) };
    const router = createServersRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
});
describe('Backup Router', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns empty array without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const router = createBackupRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
  it('GET / returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const backups = [{ id: 'b1', name: 'daily-backup', status: 'completed' }];
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: backups })) };
    const router = createBackupRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
  it('POST / creates backup (201)', async () => {
    const { res, getStatus, getBody } = createRes();
    req = createReq({ body: { serverId: 'srv-1', mode: 'full' }, method: 'POST' as const });
    const created = { id: 'b2', status: 'running' };
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: created })) };
    const router = createBackupRouter(di);
    const route = getRoute(router, 'post', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(201);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
});
describe('Docker Router', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns empty array without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const router = createDockerRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
  it('GET / returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const containers = [{ id: 'c1', name: 'nginx', status: 'running' }];
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: containers })) };
    const router = createDockerRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
});
describe('Tunnel Router', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns default config without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const router = createTunnelRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
  it('GET / returns config on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const config = { provider: 'cloudflare', domain: 'example.com' };
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: config })) };
    const router = createTunnelRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
});
describe('GitHub Router', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns empty array without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const router = createGitHubRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
  it('GET / returns repos on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const repos = [{ name: 'my-dash', stars: 42 }];
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: repos })) };
    const router = createGitHubRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
});
describe('Plugin Router', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns empty array without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const router = createPluginRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
  it('GET / returns plugins on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const plugins = [{ id: 'p1', name: 'monitor', version: '1.0' }];
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: plugins })) };
    const router = createPluginRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });
});
