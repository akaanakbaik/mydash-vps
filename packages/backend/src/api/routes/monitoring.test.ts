import { describe, it, expect, vi } from 'vitest';
import { createMonitoringRouter, createDashboardRouter, createAnalyticsRouter, createHealthRouter } from './monitoring.js';

function createMockDi() {
  return { resolve: vi.fn().mockReturnValue(null) } as never;
}

describe('createMonitoringRouter', () => {
  it('should return a router', () => { const r = createMonitoringRouter(createMockDi()); expect(r).toBeDefined(); });
});

describe('createDashboardRouter', () => {
  it('should return a router', () => { const r = createDashboardRouter(createMockDi()); expect(r).toBeDefined(); });
});

describe('createAnalyticsRouter', () => {
  it('should return a router', () => { const r = createAnalyticsRouter(createMockDi()); expect(r).toBeDefined(); });
});

describe('createHealthRouter', () => {
  it('should return a router', () => { const r = createHealthRouter(createMockDi()); expect(r).toBeDefined(); });
});
