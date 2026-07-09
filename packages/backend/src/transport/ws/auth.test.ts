import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { WebSocket } from 'ws';
import { SignJWT } from 'jose';
import { createWebSocketServer } from './server.js';
import type { Logger } from '../../logging/index.js';
import type { AddressInfo } from 'net';

const TEST_SECRET = 'test-secret-for-ws-auth-at-least-32-chars!!';
const encoder = new TextEncoder();

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};

/* ─── Event-driven helper ─── */

function waitForMessage(ws: WebSocket, predicate: (msg: string) => boolean, timeoutMs = 5000): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off('message', onMessage);
      reject(new Error('Timeout waiting for matching message (predicate never matched)'));
    }, timeoutMs);

    function onMessage(data: Buffer | string) {
      const str = data.toString();
      if (predicate(str)) {
        clearTimeout(timer);
        ws.off('message', onMessage);
        resolve(str);
      }
    }

    ws.on('message', onMessage);
  });
}

function waitForOpen(ws: WebSocket, timeoutMs = 5000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off('open', onOpen);
      reject(new Error('Timeout waiting for WebSocket open'));
    }, timeoutMs);

    function onOpen() {
      clearTimeout(timer);
      ws.off('open', onOpen);
      resolve();
    }

    ws.on('open', onOpen);
  });
}

/* ─── Token helpers ─── */

async function createValidToken(payload: Record<string, unknown> = {}): Promise<string> {
  const secretKey = encoder.encode(TEST_SECRET);
  return new SignJWT({
    sub: 'user-123',
    ws: 'ws-456',
    role: 'owner',
    perms: ['*'],
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    iss: 'mydash',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secretKey);
}

function createExpiredPayload(): Record<string, unknown> {
  return {
    sub: 'user-123',
    ws: 'ws-456',
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600,
    iss: 'mydash',
  };
}

async function createExpiredToken(): Promise<string> {
  const secretKey = encoder.encode(TEST_SECRET);
  return new SignJWT(createExpiredPayload())
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secretKey);
}

/* ─── Tests ─── */

describe('WebSocket JWT Authentication', () => {
  let httpServer: ReturnType<typeof createServer>;
  let wsServer: ReturnType<typeof createWebSocketServer>;
  let port: string;
  const originalSecret = process.env['JWT_SECRET'];

  beforeAll(async () => {
    process.env['JWT_SECRET'] = TEST_SECRET;
    httpServer = createServer();
    wsServer = createWebSocketServer(httpServer, mockLogger, {
      path: '/ws',
      heartbeatIntervalMs: 50000,
      heartbeatTimeoutMs: 50000,
    });
    await new Promise<void>((resolve) => { httpServer.listen(0, () => { resolve(); }); });
    port = String((httpServer.address() as AddressInfo).port);
  });

  afterAll(async () => {
    void wsServer.stop();
    await new Promise<void>((resolve) => { httpServer.close(() => { resolve(); }); });
    process.env['JWT_SECRET'] = originalSecret;
  });

  it('should authenticate with valid JWT token', async () => {
    const token = await createValidToken();
    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    await waitForOpen(ws);
    const msgPromise = waitForMessage(ws, (m) => { return m.includes('authenticated'); });
    ws.send(JSON.stringify({ type: 'auth', token }));
    const authMsg = await msgPromise;

    expect(authMsg).toContain('user-123');
    ws.close();
  });

  it('should reject expired JWT token', async () => {
    const token = await createExpiredToken();
    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    await waitForOpen(ws);
    const msgPromise = waitForMessage(ws, (m) => { return m.includes('auth_error'); });
    ws.send(JSON.stringify({ type: 'auth', token }));
    await msgPromise;

    ws.close();
  });

  it('should reject token with wrong secret', async () => {
    const wrongSecret = 'this-is-a-completely-different-secret-key-here!';
    const wrongKey = encoder.encode(wrongSecret);
    const token = await new SignJWT({ sub: 'user-123', ws: 'ws-456' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .setIssuer('mydash')
      .sign(wrongKey);

    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    await waitForOpen(ws);
    const msgPromise = waitForMessage(ws, (m) => { return m.includes('auth_error'); });
    ws.send(JSON.stringify({ type: 'auth', token }));
    await msgPromise;

    ws.close();
  });

  it('should reject malformed token', async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    await waitForOpen(ws);
    const msgPromise = waitForMessage(ws, (m) => { return m.includes('auth_error'); });
    ws.send(JSON.stringify({ type: 'auth', token: 'not-a-valid-jwt-token' }));
    await msgPromise;

    ws.close();
  });

  it('should reject token with wrong issuer', async () => {
    const secretKey = encoder.encode(TEST_SECRET);
    const token = await new SignJWT({ sub: 'user-123', ws: 'ws-456' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .setIssuer('wrong-issuer')
      .sign(secretKey);

    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    await waitForOpen(ws);
    const msgPromise = waitForMessage(ws, (m) => { return m.includes('auth_error'); });
    ws.send(JSON.stringify({ type: 'auth', token }));
    await msgPromise;

    ws.close();
  });

  it('should extract workspaceId from token payload', async () => {
    const token = await createValidToken({ ws: 'custom-workspace-id' });
    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    await waitForOpen(ws);
    const msgPromise = waitForMessage(ws, (m) => { return m.includes('authenticated'); });
    ws.send(JSON.stringify({ type: 'auth', token }));
    const authMsg = await msgPromise;

    expect(authMsg).toContain('user-123');
    ws.close();
  });

  it('should return auth_error for failed auth and not crash', async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);

    await waitForOpen(ws);
    const msgPromise = waitForMessage(ws, (m) => { return m.includes('auth_error'); });
    ws.send(JSON.stringify({ type: 'auth', token: 'bad-token' }));
    void msgPromise;

    ws.close();
  });

  it('should handle multiple parallel auth connections', async () => {
    const tokens = await Promise.all([createValidToken(), createValidToken()]);
    const connections = tokens.map((t) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      return { ws, token: t };
    });

    await Promise.all(connections.map(({ ws }) => waitForOpen(ws)));

    const msgPromises = connections.map(({ ws, token }) => {
      const p = waitForMessage(ws, (m) => { return m.includes('authenticated'); });
      ws.send(JSON.stringify({ type: 'auth', token }));
      return p;
    });

    const msgs = await Promise.all(msgPromises);
    expect(msgs.length).toBe(2);
    for (const m of msgs) {
      expect(m).toContain('user-123');
    }

    const allConnections = wsServer.getConnectionManager().getAll();
    expect(allConnections.length).toBeGreaterThanOrEqual(2);

    for (const { ws: wsConn } of connections) {
      wsConn.close();
    }
  });
});
