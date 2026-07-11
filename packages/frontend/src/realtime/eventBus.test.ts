import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from './eventBus.js';
import type { Channel, RealtimeEvent } from './types.js';
function createEvent(overrides: Partial<RealtimeEvent> = {}): RealtimeEvent {
  return {
    id: `evt-${String(Date.now())}-${Math.random().toString(36).slice(2, 6)}`,
    type: overrides.type ?? 'metric.updated',
    channel: overrides.channel ?? 'monitoring',
    sequence: overrides.sequence ?? 1,
    version: overrides.version ?? 1,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    payload: overrides.payload ?? {},
    correlationId: 'corr-1',
    traceId: 'trace-1',
    workspaceId: 'ws-1',
    ...overrides,
  };
}
describe('EventBus', () => {
  let bus: EventBus;
  beforeEach(() => {
    bus = new EventBus();
  });
  afterEach(() => {
    bus.dispose();
  });
  describe('Validation', () => {
    it('should reject event without id', () => {
      const event = createEvent({ id: undefined });
      expect(bus.validate(event)).toBe(false);
    });
    it('should reject event without type', () => {
      const event = createEvent({ type: undefined });
      expect(bus.validate(event)).toBe(false);
    });
    it('should reject event with invalid channel', () => {
      const event = createEvent({ channel: 'invalid-channel' as Channel });
      expect(bus.validate(event)).toBe(false);
    });
    it('should reject event with invalid timestamp', () => {
      const event = createEvent({ timestamp: 'not-a-date' });
      expect(bus.validate(event)).toBe(false);
    });
    it('should reject event with negative sequence', () => {
      const event = createEvent({ sequence: -1 });
      expect(bus.validate(event)).toBe(false);
    });
    it('should accept valid event', () => {
      const event = createEvent();
      expect(bus.validate(event)).toBe(true);
    });
  });
  describe('Deduplication', () => {
    it('should dispatch unique events', () => {
      const handler = vi.fn();
      bus.on('metric.updated', handler);
      bus.dispatch(createEvent({ id: 'evt-1' }));
      bus.dispatch(createEvent({ id: 'evt-2' }));
      expect(handler).toHaveBeenCalledTimes(2);
    });
    it('should reject duplicate event id', () => {
      const handler = vi.fn();
      bus.on('metric.updated', handler);
      bus.dispatch(createEvent({ id: 'evt-1' }));
      bus.dispatch(createEvent({ id: 'evt-1' }));
      expect(handler).toHaveBeenCalledTimes(1);
    });
    it('should track processed events', () => {
      bus.dispatch(createEvent({ id: 'evt-1' }));
      expect(bus.hasProcessed('evt-1')).toBe(true);
    });
    it('should report processed count', () => {
      bus.dispatch(createEvent({ id: 'evt-1' }));
      bus.dispatch(createEvent({ id: 'evt-2' }));
      expect(bus.getProcessedCount()).toBe(2);
    });
    it('should clear processed events', () => {
      bus.dispatch(createEvent({ id: 'evt-1' }));
      bus.clearProcessed();
      expect(bus.getProcessedCount()).toBe(0);
    });
  });
  describe('Event Dispatch', () => {
    it('should dispatch to matching type handler', () => {
      const handler = vi.fn();
      bus.on('metric.updated', handler);
      bus.dispatch(createEvent({ type: 'metric.updated' }));
      expect(handler).toHaveBeenCalledTimes(1);
    });
    it('should not dispatch to non-matching type handler', () => {
      const handler = vi.fn();
      bus.on('metric.updated', handler);
      bus.dispatch(createEvent({ type: 'health.updated' }));
      expect(handler).not.toHaveBeenCalled();
    });
    it('should dispatch to channel handler', () => {
      const handler = vi.fn();
      bus.onChannel('monitoring', handler);
      bus.dispatch(createEvent({ type: 'metric.updated', channel: 'monitoring' }));
      expect(handler).toHaveBeenCalledTimes(1);
    });
    it('should handle multiple handlers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus.on('metric.updated', handler1);
      bus.on('metric.updated', handler2);
      bus.dispatch(createEvent({ type: 'metric.updated' }));
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
    it('should apply filter to handler', () => {
      const handler = vi.fn();
      const filter = vi.fn((e: { channel: string }) => e.channel === 'monitoring');
      bus.on('metric.updated', handler, filter);
      bus.dispatch(createEvent({ type: 'metric.updated', channel: 'health' }));
      bus.dispatch(createEvent({ type: 'metric.updated', channel: 'monitoring' }));
      expect(filter).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledTimes(1);
    });
    it('should dispatch batch events in order', () => {
      const handler = vi.fn();
      bus.on('metric.updated', handler);
      bus.dispatchBatch([
        createEvent({ id: 'batch-1', type: 'metric.updated' }),
        createEvent({ id: 'batch-2', type: 'metric.updated' }),
        createEvent({ id: 'batch-3', type: 'metric.updated' }),
      ]);
      expect(handler).toHaveBeenCalledTimes(3);
    });
    it('should remove duplicate in batch', () => {
      const handler = vi.fn();
      bus.on('metric.updated', handler);
      bus.dispatchBatch([
        createEvent({ id: 'dup-id', type: 'metric.updated' }),
        createEvent({ id: 'dup-id', type: 'metric.updated' }),
      ]);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
  describe('Handler Cleanup', () => {
    it('should stop receiving events after unsubscribe', () => {
      const handler = vi.fn();
      const unsubscribe = bus.on('metric.updated', handler);
      bus.dispatch(createEvent({ type: 'metric.updated', id: 'evt-1' }));
      unsubscribe();
      bus.dispatch(createEvent({ type: 'metric.updated', id: 'evt-2' }));
      expect(handler).toHaveBeenCalledTimes(1);
    });
    it('should handle multiple unsubscribe calls safely', () => {
      const handler = vi.fn();
      const unsubscribe = bus.on('metric.updated', handler);
      unsubscribe();
      expect(() => { unsubscribe(); }).not.toThrow();
    });
  });
  describe('Memory Growth Pruning', () => {
    it('should accept up to 500 events without pruning', () => {
      const handler = vi.fn();
      for (let i = 0; i < 500; i++) {
        bus.on('metric.updated', handler);
        bus.dispatch(createEvent({
          id: `prune-safe-${String(i)}`,
          type: 'metric.updated',
          channel: 'monitoring',
          sequence: i,
          version: 1,
          timestamp: new Date().toISOString(),
        }));
      }
      expect(bus.getProcessedCount()).toBe(500);
    });
    it('should prune 10% of oldest events when exceeding 10K threshold', () => {
      const targetEvents = 10_100;
      for (let i = 0; i < targetEvents; i++) {
        bus.dispatch(createEvent({
          id: `prune-mass-${String(i)}`,
          type: 'metric.updated',
          channel: 'monitoring',
          sequence: i,
          version: 1,
          timestamp: new Date().toISOString(),
        }));
      }
      const remaining = bus.getProcessedCount();
      expect(remaining).toBeLessThan(targetEvents);
      expect(remaining).toBeGreaterThanOrEqual(9_000);
      expect(remaining).toBeLessThanOrEqual(10_000);
      expect(bus.hasProcessed('prune-mass-0')).toBe(false);
      expect(bus.hasProcessed('prune-mass-500')).toBe(false);
      expect(bus.hasProcessed('prune-mass-1500')).toBe(true);
      expect(bus.hasProcessed(`prune-mass-${String(targetEvents - 1)}`)).toBe(true);
    });
    it('should still work after dispose', () => {
      bus.dispose();
      const handler = vi.fn();
      bus.on('metric.updated', handler);
      bus.dispatch(createEvent({ type: 'metric.updated', id: 'post-dispose' }));
      expect(handler).toHaveBeenCalledTimes(1);
    });
    it('should clear all data on dispose', () => {
      bus.dispatch(createEvent({ id: 'dispose-evt', type: 'metric.updated', channel: 'monitoring', sequence: 1, version: 1, timestamp: new Date().toISOString(), payload: {}, correlationId: 'c', traceId: 't', workspaceId: 'w' }));
      bus.dispose();
      expect(bus.getProcessedCount()).toBe(0);
    });
  });
});
