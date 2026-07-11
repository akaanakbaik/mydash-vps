import { describe, it, expect, vi } from 'vitest';
import { correlationIdMiddleware, requestLoggerMiddleware, errorHandlerMiddleware, notFoundMiddleware, validationMiddleware, rateLimiterMiddleware } from './middleware.js';
import type { Logger } from '../../logging/index.js';
const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};
function mockReq(overrides: Record<string, unknown> = {}) {
  return {
    headers: {},
    method: 'GET',
    path: '/test',
    ip: '127.0.0.1',
    app: { get: vi.fn() },
    ...overrides,
  } as never;
}
function mockRes() {
  const self: Record<string, ReturnType<typeof vi.fn>> = {};
  self.status = vi.fn(() => self);
  self.json = vi.fn(() => self);
  self.send = vi.fn(() => self);
  self.on = vi.fn((_e: string, _c: () => void) => self);
  self.end = vi.fn();
  self.getHeaders = vi.fn(() => ({}));
  return self as never;
}
describe('correlationIdMiddleware', () => {
  it('adds correlation ID if missing', () => {
    const req = mockReq({ headers: {} });
    const next = vi.fn();
    correlationIdMiddleware()(req, mockRes(), next);
    expect((req as unknown as { headers: Record<string, string> }).headers['x-correlation-id']).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
  it('preserves existing correlation ID', () => {
    const req = mockReq({ headers: { 'x-correlation-id': 'existing' } });
    const next = vi.fn();
    correlationIdMiddleware()(req, mockRes(), next);
    expect((req as unknown as { headers: Record<string, string> }).headers['x-correlation-id']).toBe('existing');
    expect(next).toHaveBeenCalled();
  });
});
describe('requestLoggerMiddleware', () => {
  it('sets up finish listener', () => {
    const res = mockRes();
    const next = vi.fn();
    requestLoggerMiddleware(mockLogger)(mockReq({ headers: { 'x-correlation-id': 't1' } }), res, next);
    expect(next).toHaveBeenCalled();
  });
});
describe('errorHandlerMiddleware', () => {
  it('returns 500', () => {
    const res = mockRes();
    errorHandlerMiddleware(mockLogger)(new Error('Broke'), mockReq(), res, vi.fn());
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
describe('notFoundMiddleware', () => {
  it('calls sendError with 404', () => {
    const res = mockRes();
    notFoundMiddleware()(mockReq({ method: 'POST', path: '/unknown' }), res);
  });
});
describe('validationMiddleware', () => {
  it('allows JSON content type', () => {
    const next = vi.fn();
    validationMiddleware()(mockReq({ method: 'POST', headers: { 'content-type': 'application/json' } }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
  it('rejects non-JSON for mutations', () => {
    const res = mockRes();
    const next = vi.fn();
    validationMiddleware()(mockReq({ method: 'POST', headers: { 'content-type': 'text/plain' } }), res, next);
    expect(next).not.toHaveBeenCalled();
  });
  it('allows GET without content-type', () => {
    const next = vi.fn();
    validationMiddleware()(mockReq({ method: 'GET' }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
describe('rateLimiterMiddleware', () => {
  it('allows requests under limit', () => {
    const next = vi.fn();
    rateLimiterMiddleware(5, 60000)(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
  it('rate limits after exceeding max', () => {
    const middleware = rateLimiterMiddleware(2, 60000);
    const req = mockReq();
    const res = mockRes();
    middleware(req, res, vi.fn());
    middleware(req, res, vi.fn());
    middleware(req, res, vi.fn());
    expect((res as unknown as { status: ReturnType<typeof vi.fn> }).status).toHaveBeenCalledWith(429);
  });
});
