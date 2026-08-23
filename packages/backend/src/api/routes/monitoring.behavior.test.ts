import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMonitoringRouter, createDashboardRouter, createAnalyticsRouter, createHealthRouter } from './monitoring.js';
import { createReq, createRes, mockUseCase, getRoute, expectSuccessEnvelope } from './test-utils.js';
const metricFixtures = [
  { metricType: 'cpu', timestamp: '2026-01-01T00:00:00.000Z', usagePercent: 10 },
  { metricType: 'memory', timestamp: '2026-01-01T00:00:00.000Z', totalBytes: 100, usedBytes: 20 },
  { metricType: 'disk', timestamp: '2026-01-01T00:00:00.000Z', usedPercent: 30 },
  { metricType: 'network', timestamp: '2026-01-01T00:00:00.000Z', rxBytesPerSec: 1048576, txBytesPerSec: 0 },
];
const healthFixture = {
  overall: 92,
  grade: 'A',
  confidence: 1,
  domainScores: [{ domain: 'cpu', score: 92, weight: 1, confidence: 1 }],
  factors: [],
  calculatedAt: '2026-01-01T00:00:00.000Z',
};
describe('Monitoring Router Behavior', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns empty object without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const route = getRoute(createMonitoringRouter(), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expect((getBody() as Record<string, unknown>).success).toBe(true);
  });
  it('GET / returns empty object when use case fails', async () => {
    const { res, getStatus, getBody } = createRes();
    const di = { resolve: vi.fn().mockReturnValue(mockUseCase({ success: false })) };
    const route = getRoute(createMonitoringRouter(di), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expect((getBody() as Record<string, unknown>).success).toBe(true);
  });
  it('GET / maps metric window into live timeline', async () => {
    const { res, getStatus, getBody } = createRes();
    const windowUseCase = mockUseCase({ success: true, data: metricFixtures });
    const di = { resolve: vi.fn((key: string) => key === 'getMetricWindowUseCase' ? windowUseCase : null) };
    const route = getRoute(createMonitoringRouter(di), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as { success: boolean; data: Record<string, unknown> };
    expect(body.success).toBe(true);
    const timeline = body.data.timeline as Array<Record<string, number>>;
    expect(timeline[0]?.cpu).toBe(10);
    expect(timeline[0]?.memory).toBe(20);
    expect(timeline[0]?.disk).toBe(30);
    expect(timeline[0]?.network).toBe(1);
  });
  it('GET /:metric returns empty object without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    req.params = { metric: 'cpu' };
    const route = getRoute(createMonitoringRouter(), 'get', '/:metric');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expect((getBody() as Record<string, unknown>).success).toBe(true);
  });
  it('GET /:metric maps requested metric only', async () => {
    const { res, getStatus, getBody } = createRes();
    req.params = { metric: 'cpu' };
    const windowUseCase = mockUseCase({ success: true, data: metricFixtures });
    const di = { resolve: vi.fn((key: string) => key === 'getMetricWindowUseCase' ? windowUseCase : null) };
    const route = getRoute(createMonitoringRouter(di), 'get', '/:metric');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as { success: boolean; data: Array<Record<string, unknown>> };
    expectSuccessEnvelope(getBody(), body.data);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.cpu).toBe(10);
  });
});
describe('Dashboard Router Behavior', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns default dashboard without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const route = getRoute(createDashboardRouter(), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expect((getBody() as Record<string, unknown>).success).toBe(true);
  });
  it('GET / maps persisted health into dashboard response', async () => {
    const { res, getStatus, getBody } = createRes();
    const healthUseCase = mockUseCase({ success: true, data: healthFixture });
    const di = { resolve: vi.fn((key: string) => key === 'getHealthScoreUseCase' ? healthUseCase : null) };
    const route = getRoute(createDashboardRouter(di), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as { success: boolean; data: Record<string, unknown> };
    expect(body.success).toBe(true);
    const health = body.data.health as Record<string, unknown>;
    expect(health.score).toBe(92);
    expect(health.grade).toBe('A');
  });
});
describe('Analytics Router Behavior', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns default analytics without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const route = getRoute(createAnalyticsRouter(), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expect((getBody() as Record<string, unknown>).success).toBe(true);
  });
  it('GET / returns data on success', async () => {
    const { res, getStatus, getBody } = createRes();
    const testData = { aggregatedMetrics: [{ metricType: 'cpu', sampleCount: 3, average: 20, min: 10, max: 30 }], anomalies: [] };
    const di = { resolve: vi.fn((key: string) => key === 'calculateAnalyticsSummaryUseCase' ? mockUseCase({ success: true, data: testData }) : null) };
    const route = getRoute(createAnalyticsRouter(di), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as { success: boolean; data: Record<string, unknown> };
    expect(body.success).toBe(true);
    expect((body.data.aggregations as Array<Record<string, unknown>>)[0]?.avg).toBe(20);
  });
});
describe('Health Router Behavior', () => {
  let req: ReturnType<typeof createReq>;
  beforeEach(() => { req = createReq(); });
  it('GET / returns default health without DI', async () => {
    const { res, getStatus, getBody } = createRes();
    const route = getRoute(createHealthRouter(), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    expect((getBody() as Record<string, unknown>).success).toBe(true);
  });
  it('GET / maps persisted health response', async () => {
    const { res, getStatus, getBody } = createRes();
    const healthUseCase = mockUseCase({ success: true, data: healthFixture });
    const di = { resolve: vi.fn((key: string) => key === 'getHealthScoreUseCase' ? healthUseCase : null) };
    const route = getRoute(createHealthRouter(di), 'get', '/');
    if (route) await route(req, res, vi.fn());
    expect(getStatus()).toBe(200);
    const body = getBody() as { success: boolean; data: Record<string, unknown> };
    expect(body.success).toBe(true);
    expect((body.data.overall as Record<string, unknown>).score).toBe(92);
    expect(body.data.grade).toBe('A');
  });
});
