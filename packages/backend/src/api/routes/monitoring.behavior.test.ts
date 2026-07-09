import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMonitoringRouter, createDashboardRouter, createAnalyticsRouter, createHealthRouter } from './monitoring.js';
import { createReq, createRes, mockUseCase, getRoute, expectSuccessEnvelope } from './test-utils.js';

describe('Monitoring Router Behavior', () => {
  let req: ReturnType<typeof createReq>;

  beforeEach(() => { req = createReq(); });

  it('GET / returns 503 without DI', async () => {
    const { res, getStatus } = createRes();
    const router = createMonitoringRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(503);
  });

  it('GET / returns 503 when use case fails', async () => {
    const { res, getStatus } = createRes();
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: false })) };
    const router = createMonitoringRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(503);
  });

  it('GET / returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const testData = { cpu: 45, memory: 60, disk: 30 };
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: testData })) };
    const router = createMonitoringRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expectSuccessEnvelope(getBody(), testData);
  });

  it('GET /:metric returns 503 without DI', async () => {
    const { res, getStatus } = createRes();
    req.params = { metric: 'cpu' };
    const router = createMonitoringRouter();
    const route = getRoute(router, 'get', '/:metric');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(503);
  });

  it('GET /:metric returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    req.params = { metric: 'cpu' };
    const testData = { metric: 'cpu', values: [10, 20, 30], windowMs: 86400000 };
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: testData })) };
    const router = createMonitoringRouter(di);
    const route = getRoute(router, 'get', '/:metric');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expectSuccessEnvelope(getBody(), testData);
  });
});

describe('Dashboard Router Behavior', () => {
  let req: ReturnType<typeof createReq>;

  beforeEach(() => { req = createReq(); });

  it('GET / returns 503 without DI', async () => {
    const { res, getStatus } = createRes();
    const router = createDashboardRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(503);
  });

  it('GET / returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const testData = { score: 85, grade: 'B', categories: [] };
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: testData })) };
    const router = createDashboardRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expectSuccessEnvelope(getBody(), testData);
  });
});

describe('Analytics Router Behavior', () => {
  let req: ReturnType<typeof createReq>;

  beforeEach(() => { req = createReq(); });

  it('GET / returns 503 without DI', async () => {
    const { res, getStatus } = createRes();
    const router = createAnalyticsRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(503);
  });

  it('GET / returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const testData = { summary: { total: 100, avg: 50 } };
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: testData })) };
    const router = createAnalyticsRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expectSuccessEnvelope(getBody(), testData);
  });
});

describe('Health Router Behavior', () => {
  let req: ReturnType<typeof createReq>;

  beforeEach(() => { req = createReq(); });

  it('GET / returns 503 without DI', async () => {
    const { res, getStatus } = createRes();
    const router = createHealthRouter();
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(503);
  });

  it('GET / returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const testData = { score: 92, grade: 'A', categories: [{ name: 'cpu', score: 95 }] };
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: true, data: testData })) };
    const router = createHealthRouter(di);
    const route = getRoute(router, 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expectSuccessEnvelope(getBody(), testData);
  });
});
