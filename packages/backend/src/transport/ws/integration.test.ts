import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { createServer, type Server } from 'http';
import { WsServer, type WsConnection } from './server.js';
import WebSocket from 'ws';
import type { Logger } from '../../logging/index.js';

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(() => mockLogger),
};

interface MockWs {
  on: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  readyState: number;
  ping: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  OPEN: number;
  CLOSED: number;
  CLOSING: number;
  CONNECTING: number;
}

function createMockWs(readyState: number = WebSocket.OPEN): MockWs {
  return {
    on: vi.fn(),
    send: vi.fn(),
    readyState,
    ping: vi.fn(),
    close: vi.fn(),
    OPEN: WebSocket.OPEN,
    CLOSED: WebSocket.CLOSED,
    CLOSING: WebSocket.CLOSING,
    CONNECTING: WebSocket.CONNECTING,
  };
}

function createConnection(ws: MockWs, overrides?: Partial<WsConnection>): WsConnection {
  return {
    ws: ws,
    id: 'c1',
    userId: null,
    workspaceId: null,
    connectedAt: new Date(),
    lastActivity: new Date(),
    subscriptions: new Set(),
    ...overrides,
  } as WsConnection;
}

describe('WsServer Integration', () => {
  let httpServer: Server;
  let wsServer: WsServer | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    httpServer = createServer();
  });

  afterEach(async () => {
    if (wsServer) await wsServer.stop();
    httpServer.close();
  });

  it('should create and start server', () => {
    wsServer = new WsServer(httpServer, mockLogger, { path: '/ws' });
    expect(wsServer.getConnectionManager()).toBeDefined();
    expect(wsServer.getSubscriptionManager()).toBeDefined();
    const metrics = wsServer.getMetrics();
    expect(metrics.connections).toBe(0);
    expect(metrics.channels).toBe(0);
  });

  it('should stop cleanly', async () => {
    wsServer = new WsServer(httpServer, mockLogger);
    await wsServer.stop();
    expect(mockLogger.info).toHaveBeenCalledWith('ws server stopped');
  });

  it('should broadcast to subscribers', () => {
    wsServer = new WsServer(httpServer, mockLogger);
    const mockWs = createMockWs();
    const conn = createConnection(mockWs, { subscriptions: new Set(['metrics']) });
    wsServer.getConnectionManager().add(mockWs as unknown as WebSocket, conn);
    wsServer.getSubscriptionManager().subscribe('metrics', mockWs as unknown as WebSocket);

    wsServer.broadcast('metrics', 'test.event', { hello: 'world' });
    expect(mockWs.send).toHaveBeenCalled();
    const sent = JSON.parse(mockWs.send.mock.calls[0][0] as string) as { type: string; channel: string; payload: unknown };
    expect(sent.type).toBe('test.event');
    expect(sent.channel).toBe('metrics');
    expect(sent.payload).toEqual({ hello: 'world' });
  });

  it('should broadcast to all connections', () => {
    wsServer = new WsServer(httpServer, mockLogger);
    const mockWs = createMockWs();
    const conn = createConnection(mockWs);
    wsServer.getConnectionManager().add(mockWs as unknown as WebSocket, conn);

    wsServer.broadcastAll('global.event', { msg: 'hello' });
    expect(mockWs.send).toHaveBeenCalled();
  });

  it('should not broadcast to CLOSED connections', () => {
    wsServer = new WsServer(httpServer, mockLogger);
    const mockWs = createMockWs(WebSocket.CLOSED);
    const conn = createConnection(mockWs, { subscriptions: new Set(['metrics']) });
    wsServer.getConnectionManager().add(mockWs as unknown as WebSocket, conn);
    wsServer.getSubscriptionManager().subscribe('metrics', mockWs as unknown as WebSocket);

    wsServer.broadcast('metrics', 'test', {});
    expect(mockWs.send).not.toHaveBeenCalled();
  });

  it('should report metrics with connection', () => {
    wsServer = new WsServer(httpServer, mockLogger);
    const mockWs = createMockWs();
    const conn = createConnection(mockWs, { userId: 'u1', workspaceId: 'ws-1' });
    wsServer.getConnectionManager().add(mockWs as unknown as WebSocket, conn);

    const metrics = wsServer.getMetrics();
    expect(metrics.connections).toBe(1);
  });
});
