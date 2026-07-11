import { WebSocketServer, type WebSocket } from 'ws';
import type { Server } from 'http';
import type { Logger } from '../../logging/index.js';
import { jwtVerify } from 'jose';
export interface WsConnection {
  ws: WebSocket;
  id: string;
  userId: string | null;
  workspaceId: string | null;
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: Set<string>;
}
export class ConnectionManager {
  private readonly connections = new Map<WebSocket, WsConnection>();
  private readonly logger: Logger;
  constructor(logger: Logger) {
    this.logger = logger;
  }
  add(ws: WebSocket, conn: WsConnection): void {
    this.connections.set(ws, conn);
    this.logger.info(`ws connected: ${conn.id}`);
  }
  remove(ws: WebSocket): void {
    const conn = this.connections.get(ws);
    if (conn) {
      this.connections.delete(ws);
      this.logger.info(`ws disconnected: ${conn.id}`);
    }
  }
  get(ws: WebSocket): WsConnection | undefined {
    return this.connections.get(ws);
  }
  getAll(): WsConnection[] {
    return Array.from(this.connections.values());
  }
  count(): number {
    return this.connections.size;
  }
}
export class SubscriptionManager {
  private readonly channels = new Map<string, Set<WebSocket>>();
  subscribe(channel: string, ws: WebSocket): void {
    const subs = this.channels.get(channel) ?? new Set();
    subs.add(ws);
    this.channels.set(channel, subs);
  }
  unsubscribe(channel: string, ws: WebSocket): void {
    const subs = this.channels.get(channel);
    if (subs) {
      subs.delete(ws);
      if (subs.size === 0) this.channels.delete(channel);
    }
  }
  unsubscribeAll(ws: WebSocket): void {
    for (const [channel, subs] of this.channels) {
      subs.delete(ws);
      if (subs.size === 0) this.channels.delete(channel);
    }
  }
  getSubscribers(channel: string): WebSocket[] {
    return Array.from(this.channels.get(channel) ?? []);
  }
  channelCount(): number {
    return this.channels.size;
  }
}
export interface WsServerConfig {
  path: string;
  heartbeatIntervalMs: number;
  heartbeatTimeoutMs: number;
}
export function createWebSocketServer(httpServer: Server, logger: Logger, config?: Partial<WsServerConfig>): WsServer {
  return new WsServer(httpServer, logger, config);
}
export class WsServer {
  private wss: WebSocketServer | null = null;
  private readonly connectionManager: ConnectionManager;
  private readonly subscriptionManager: SubscriptionManager;
  private readonly logger: Logger;
  private readonly config: WsServerConfig;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  constructor(httpServer: Server, logger: Logger, config?: Partial<WsServerConfig>) {
    this.connectionManager = new ConnectionManager(logger);
    this.subscriptionManager = new SubscriptionManager();
    this.logger = logger;
    this.config = { path: '/ws', heartbeatIntervalMs: 30000, heartbeatTimeoutMs: 10000, ...config };
    this.wss = new WebSocketServer({ server: httpServer, path: this.config.path });
    this.wss.on('connection', (ws: WebSocket) => {
      const conn: WsConnection = {
        ws,
        id: crypto.randomUUID(),
        userId: null,
        workspaceId: null,
        connectedAt: new Date(),
        lastActivity: new Date(),
        subscriptions: new Set(),
      };
      this.connectionManager.add(ws, conn);
      ws.on('message', (raw: Buffer) => {
        try {
          const data = JSON.parse(raw.toString()) as { type: string; channel?: string; payload?: unknown; token?: string };
          conn.lastActivity = new Date();
          if (data.type === 'subscribe' && data.channel) {
            this.subscriptionManager.subscribe(data.channel, ws);
            conn.subscriptions.add(data.channel);
            ws.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
          } else if (data.type === 'unsubscribe' && data.channel) {
            this.subscriptionManager.unsubscribe(data.channel, ws);
            conn.subscriptions.delete(data.channel);
          } else if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          } else if (data.type === 'auth' && data.token) {
            void this.authenticateConnection(ws, conn, data.token);
          }
        } catch {
          this.logger.error('invalid ws message');
        }
      });
      ws.on('close', () => {
        this.subscriptionManager.unsubscribeAll(ws);
        this.connectionManager.remove(ws);
      });
      ws.send(JSON.stringify({ type: 'connected', connectionId: conn.id }));
    });
    this.startHeartbeat();
  }
  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }
  getSubscriptionManager(): SubscriptionManager {
    return this.subscriptionManager;
  }
  broadcast(channel: string, event: string, payload: unknown): void {
    const subs = this.subscriptionManager.getSubscribers(channel);
    const data = JSON.stringify({ type: event, channel, payload, timestamp: new Date().toISOString() });
    for (const ws of subs) {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    }
  }
  broadcastAll(event: string, payload: unknown): void {
    const data = JSON.stringify({ type: event, payload, timestamp: new Date().toISOString() });
    for (const conn of this.connectionManager.getAll()) {
      if (conn.ws.readyState === conn.ws.OPEN) {
        conn.ws.send(data);
      }
    }
  }
  getMetrics() {
    return {
      connections: this.connectionManager.count(),
      channels: this.subscriptionManager.channelCount(),
    };
  }
  stop(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      this.logger.info('ws server stopped');
    }
    return Promise.resolve();
  }
  private async authenticateConnection(ws: WebSocket, conn: WsConnection, token: string): Promise<void> {
    try {
      const encoder = new TextEncoder();
      const secret = process.env['JWT_SECRET'];
      if (!secret) {
        ws.send(JSON.stringify({ type: 'auth_error', message: 'Server not configured' }));
        return;
      }
      const secretKey = encoder.encode(secret);
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ['HS256'],
        issuer: 'mydash',
      });
      conn.userId = typeof payload.sub === 'string' ? payload.sub : null;
      conn.workspaceId = typeof payload.ws === 'string' ? payload.ws : null;
      this.logger.info('ws authenticated', { userId: conn.userId });
      ws.send(JSON.stringify({ type: 'authenticated', userId: conn.userId }));
    } catch {
      this.logger.warn('ws auth failed - invalid token');
      ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
    }
  }
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      for (const conn of this.connectionManager.getAll()) {
        if (conn.ws.readyState === conn.ws.OPEN) {
          const idle = now - conn.lastActivity.getTime();
          if (idle > this.config.heartbeatTimeoutMs) {
            conn.ws.close(1000, 'heartbeat timeout');
          } else {
            conn.ws.ping(() => {});
          }
        }
      }
    }, this.config.heartbeatIntervalMs);
  }
}
