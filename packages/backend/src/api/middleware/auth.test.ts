import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateMiddleware, requirePermission, requireWorkspace } from './auth.js';
import type { Logger } from '../../logging/index.js';
type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};
function createMockRes(): MockResponse {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}
function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    path: '/api/v1/servers',
    headers: {},
    ip: '127.0.0.1',
    app: { get: vi.fn() },
    method: 'GET',
    ...overrides,
  } as never;
}
const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};
describe('authenticateMiddleware', () => {
  let middleware: ReturnType<typeof authenticateMiddleware>;
  beforeEach(() => {
    vi.clearAllMocks();
    middleware = authenticateMiddleware('test-secret-not-empty', mockLogger);
  });
  it('should skip auth for public paths', async () => {
    const req = createMockReq({ path: '/api/v1/auth/login' });
    const res = createMockRes();
    const next = vi.fn();
    await middleware(req, res as never, next);
    expect(next).toHaveBeenCalled();
  });
  it('should skip auth for health path', async () => {
    const req = createMockReq({ path: '/health' });
    const res = createMockRes();
    const next = vi.fn();
    await middleware(req, res as never, next);
    expect(next).toHaveBeenCalled();
  });
  it('should reject missing auth header', async () => {
    const req = createMockReq({ path: '/api/v1/servers', headers: {} });
    const res = createMockRes();
    const next = vi.fn();
    await middleware(req, res as never, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
  it('should reject empty token', async () => {
    const req = createMockReq({
      path: '/api/v1/servers',
      headers: { authorization: 'Bearer ' },
    });
    const res = createMockRes();
    const next = vi.fn();
    await middleware(req, res as never, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
  it('should reject non-Bearer authorization', async () => {
    const req = createMockReq({
      path: '/api/v1/servers',
      headers: { authorization: 'Basic xxx' },
    });
    const res = createMockRes();
    const next = vi.fn();
    await middleware(req, res as never, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
describe('requirePermission', () => {
  it('should reject when no auth', () => {
    const middleware = requirePermission('admin');
    const req = {
      path: '/api/v1/servers',
      headers: {},
      ip: '127.0.0.1',
      app: { get: vi.fn() },
      method: 'GET',
      auth: undefined,
    } as never;
    const res = createMockRes();
    const next = vi.fn();
    middleware(req, res as never, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
  it('should allow when user has permission', () => {
    const middleware = requirePermission('admin');
    const req = {
      path: '/api/v1/servers',
      headers: {},
      ip: '127.0.0.1',
      app: { get: vi.fn() },
      method: 'GET',
      auth: { userId: 'u1', role: 'owner', workspaceId: 'ws-1', permissions: ['admin', 'read'], tokenVersion: 1, sessionId: 's1' },
    } as never;
    const res = createMockRes();
    const next = vi.fn();
    middleware(req, res as never, next);
    expect(next).toHaveBeenCalled();
  });
  it('should reject when user lacks permission', () => {
    const middleware = requirePermission('superadmin');
    const req = {
      path: '/api/v1/servers',
      headers: {},
      ip: '127.0.0.1',
      app: { get: vi.fn() },
      method: 'GET',
      auth: { userId: 'u1', role: 'member', workspaceId: 'ws-1', permissions: ['read'], tokenVersion: 1, sessionId: 's1' },
    } as never;
    const res = createMockRes();
    const next = vi.fn();
    middleware(req, res as never, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
describe('requireWorkspace', () => {
  it('should allow matching workspace', () => {
    const middleware = requireWorkspace();
    const req = {
      path: '/api/v1/servers',
      headers: {},
      ip: '127.0.0.1',
      app: { get: vi.fn() },
      method: 'GET',
      params: { workspaceId: 'ws-1' },
      query: {},
      auth: { userId: 'u1', role: 'owner', workspaceId: 'ws-1', permissions: ['*'], tokenVersion: 1, sessionId: 's1' },
    } as never;
    const res = createMockRes();
    const next = vi.fn();
    middleware(req, res as never, next);
    expect(next).toHaveBeenCalled();
  });
  it('should reject workspace mismatch', () => {
    const middleware = requireWorkspace();
    const req = {
      path: '/api/v1/servers',
      headers: {},
      ip: '127.0.0.1',
      app: { get: vi.fn() },
      method: 'GET',
      params: { workspaceId: 'ws-2' },
      query: {},
      auth: { userId: 'u1', role: 'owner', workspaceId: 'ws-1', permissions: ['*'], tokenVersion: 1, sessionId: 's1' },
    } as never;
    const res = createMockRes();
    const next = vi.fn();
    middleware(req, res as never, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
  it('should allow when no workspace param', () => {
    const middleware = requireWorkspace();
    const req = {
      path: '/api/v1/servers',
      headers: {},
      ip: '127.0.0.1',
      app: { get: vi.fn() },
      method: 'GET',
      params: {},
      query: {},
      auth: { userId: 'u1', role: 'owner', workspaceId: 'ws-1', permissions: ['*'], tokenVersion: 1, sessionId: 's1' },
    } as never;
    const res = createMockRes();
    const next = vi.fn();
    middleware(req, res as never, next);
    expect(next).toHaveBeenCalled();
  });
});
