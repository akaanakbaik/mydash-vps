import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionManager, SubscriptionManager } from './server.js';
import type { Logger } from '../../logging/index.js';
const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};
const OPEN = 1;
function createMockWs() {
  return {
    on: vi.fn(),
    send: vi.fn(),
    ping: vi.fn(),
    close: vi.fn(),
    readyState: OPEN,
  } as never;
}
describe('ConnectionManager', () => {
  let cm: ConnectionManager;
  beforeEach(() => {
    vi.clearAllMocks();
    cm = new ConnectionManager(mockLogger);
  });
  it('should start with zero connections', () => {
    expect(cm.count()).toBe(0);
  });
  it('should add and count connections', () => {
    const ws = createMockWs();
    cm.add(ws, { ws, id: 'conn-1', userId: null, workspaceId: null, connectedAt: new Date(), lastActivity: new Date(), subscriptions: new Set() });
    expect(cm.count()).toBe(1);
  });
  it('should remove connections', () => {
    const ws = createMockWs();
    cm.add(ws, { ws, id: 'conn-1', userId: null, workspaceId: null, connectedAt: new Date(), lastActivity: new Date(), subscriptions: new Set() });
    cm.remove(ws);
    expect(cm.count()).toBe(0);
  });
  it('should get connection by ws reference', () => {
    const ws = createMockWs();
    cm.add(ws, { ws, id: 'conn-1', userId: 'u1', workspaceId: 'ws-1', connectedAt: new Date(), lastActivity: new Date(), subscriptions: new Set() });
    const conn = cm.get(ws);
    expect(conn).toBeDefined();
    expect(conn?.userId).toBe('u1');
  });
  it('should return all connections', () => {
    const ws1 = createMockWs();
    const ws2 = createMockWs();
    cm.add(ws1, { ws: ws1, id: 'c1', userId: null, workspaceId: null, connectedAt: new Date(), lastActivity: new Date(), subscriptions: new Set() });
    cm.add(ws2, { ws: ws2, id: 'c2', userId: null, workspaceId: null, connectedAt: new Date(), lastActivity: new Date(), subscriptions: new Set() });
    expect(cm.getAll()).toHaveLength(2);
  });
  it('should return undefined for unknown ws', () => {
    expect(cm.get(createMockWs())).toBeUndefined();
  });
  it('should handle remove for unknown ws gracefully', () => {
    expect(() => { cm.remove(createMockWs()); }).not.toThrow();
  });
});
describe('SubscriptionManager', () => {
  let sm: SubscriptionManager;
  let ws1: ReturnType<typeof createMockWs>;
  let ws2: ReturnType<typeof createMockWs>;
  beforeEach(() => {
    sm = new SubscriptionManager();
    ws1 = createMockWs();
    ws2 = createMockWs();
  });
  it('should subscribe to a channel', () => {
    sm.subscribe('metrics', ws1);
    expect(sm.getSubscribers('metrics')).toHaveLength(1);
  });
  it('should track channel count', () => {
    sm.subscribe('metrics', ws1);
    expect(sm.channelCount()).toBe(1);
  });
  it('should allow multiple subscribers to same channel', () => {
    sm.subscribe('metrics', ws1);
    sm.subscribe('metrics', ws2);
    expect(sm.getSubscribers('metrics')).toHaveLength(2);
  });
  it('should unsubscribe from a channel', () => {
    sm.subscribe('metrics', ws1);
    sm.subscribe('metrics', ws2);
    sm.unsubscribe('metrics', ws1);
    expect(sm.getSubscribers('metrics')).toHaveLength(1);
  });
  it('should remove channel when last subscriber unsubscribes', () => {
    sm.subscribe('metrics', ws1);
    sm.unsubscribe('metrics', ws1);
    expect(sm.channelCount()).toBe(0);
  });
  it('should unsubscribe from all channels', () => {
    sm.subscribe('metrics', ws1);
    sm.subscribe('alerts', ws1);
    sm.unsubscribeAll(ws1);
    expect(sm.channelCount()).toBe(0);
  });
  it('should return empty array for unknown channel', () => {
    expect(sm.getSubscribers('unknown')).toEqual([]);
  });
  it('should handle unsubscribe from unknown channel gracefully', () => {
    expect(() => { sm.unsubscribe('unknown', ws1); }).not.toThrow();
  });
});
