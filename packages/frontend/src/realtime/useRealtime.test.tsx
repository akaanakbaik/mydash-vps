// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useRealtimeAutoConnect, useRealtimeEvent } from './useRealtime.js';
const mockOnEvent = vi.fn().mockReturnValue(vi.fn());
const mockConnect = vi.fn();
const mockGetState = vi.fn().mockReturnValue({
  status: 'disconnected',
  latency: 0,
  lastPong: 0,
  reconnectAttempt: 0,
  nextReconnectDelay: 1000,
  uptime: 0,
});
const mockOnConnectionState = vi.fn().mockReturnValue(vi.fn());
const mockOnStatusChange = vi.fn().mockReturnValue(vi.fn());
vi.mock('./index.js', () => ({
  getRealtimeManager: vi.fn(() => ({
    onEvent: mockOnEvent,
    connect: mockConnect,
    getState: mockGetState,
    onConnectionState: mockOnConnectionState,
    onStatusChange: mockOnStatusChange,
    subscribe: vi.fn().mockReturnValue(vi.fn()),
    isConnected: vi.fn().mockReturnValue(false),
    connection: {
      subscribeToEvents: vi.fn().mockReturnValue(vi.fn()),
      onConnectionState: mockOnConnectionState,
      onStatusChange: mockOnStatusChange,
      getState: mockGetState,
      connect: mockConnect,
      disconnect: vi.fn(),
      getStatus: vi.fn().mockReturnValue('disconnected'),
    },
  })),
  resetRealtimeManager: vi.fn(),
}));
describe('useRealtimeAutoConnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
  });
  it('should call connect on mount when shouldConnect is true', () => {
    renderHook(() => { useRealtimeAutoConnect(true); });
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });
  it('should NOT call connect when shouldConnect is false', () => {
    renderHook(() => { useRealtimeAutoConnect(false); });
    expect(mockConnect).not.toHaveBeenCalled();
  });
  it('should call connect only once on multiple renders', () => {
    const { rerender } = renderHook(() => { useRealtimeAutoConnect(true); });
    expect(mockConnect).toHaveBeenCalledTimes(1);
    rerender();
    expect(mockConnect).toHaveBeenCalledTimes(1);
    rerender();
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });
  it('should default to shouldConnect=true', () => {
    renderHook(() => { useRealtimeAutoConnect(); });
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });
  it('should connect again when shouldConnect changes from false to true', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => { useRealtimeAutoConnect(enabled); },
      { initialProps: { enabled: false } },
    );
    expect(mockConnect).not.toHaveBeenCalled();
    rerender({ enabled: true });
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });
});
describe('useRealtimeEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
  });
  it('should subscribe to event type on mount', () => {
    const handler = vi.fn();
    renderHook(() => { useRealtimeEvent('metric.updated', handler, []); });
    expect(mockOnEvent).toHaveBeenCalledWith('metric.updated', expect.any(Function));
  });
  it('should unsubscribe on unmount', () => {
    const unsubscribe = vi.fn();
    mockOnEvent.mockReturnValue(unsubscribe);
    const { unmount } = renderHook(() => { useRealtimeEvent('metric.updated', vi.fn(), []); });
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
  it('should resubscribe when eventType changes', () => {
    const unsubscribe = vi.fn();
    mockOnEvent.mockReturnValue(unsubscribe);
    const { rerender } = renderHook(
      ({ type }: { type: string }) => { useRealtimeEvent(type, vi.fn(), []); },
      { initialProps: { type: 'metric.updated' } },
    );
    expect(mockOnEvent).toHaveBeenCalledWith('metric.updated', expect.any(Function));
    rerender({ type: 'health.updated' });
    expect(unsubscribe).toHaveBeenCalled();
    expect(mockOnEvent).toHaveBeenCalledWith('health.updated', expect.any(Function));
    expect(mockOnEvent).toHaveBeenCalledTimes(2);
  });
  it('should not resubscribe when deps are stable', () => {
    const handler = vi.fn();
    renderHook(() => { useRealtimeEvent('metric.updated', handler, []); });
    expect(mockOnEvent).toHaveBeenCalledTimes(1);
  });
});
