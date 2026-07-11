import { vi, expect } from 'vitest';
import type { Router } from 'express';
export interface MockRequest {
  headers: Record<string, unknown>;
  body: Record<string, unknown>;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  auth: Record<string, unknown>;
  method: string;
  path: string;
  [key: string]: unknown;
}
export interface MockResponse {
  json: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  sendStatus: ReturnType<typeof vi.fn>;
}
export function createReq(overrides?: Record<string, unknown>): MockRequest {
  return {
    headers: {},
    body: {},
    params: {},
    query: {},
    auth: { userId: 'u1', workspaceId: 'ws-1', role: 'admin', permissions: [], tokenVersion: 1, sessionId: 's1' },
    method: 'GET',
    path: '/',
    ...overrides,
  };
}
export function createRes(): { res: MockResponse; getStatus: () => number; getBody: () => unknown } {
  let statusCode = 200;
  let bodyData: unknown = null;
  const json = vi.fn((data: unknown) => { bodyData = data; return res; });
  const status = vi.fn((code: number) => { statusCode = code; return res; });
  const end = vi.fn();
  const send = vi.fn();
  const sendStatus = vi.fn();
  const res: MockResponse = { json, status, end, send, sendStatus };
  return { res, getStatus: () => statusCode, getBody: () => bodyData };
}
export function mockUseCase(result: { success: boolean; data?: unknown; error?: unknown }): { execute: ReturnType<typeof vi.fn> } {
  return { execute: vi.fn().mockResolvedValue(result) };
}
type RouteHandler = (req: unknown, res: unknown, next: unknown) => Promise<void> | void;
export function getRoute(router: Router, method: string, path: string): RouteHandler | null {
  try {
    const stack = (router as unknown as { stack: unknown[] }).stack;
    for (const layer of stack) {
      const route = (layer as { route?: { path: string; stack: Array<{ method: string; handle: unknown }> } }).route;
      if (route && route.path === path) {
        for (const handler of route.stack) {
          if (handler.method === method) {
            return handler.handle as RouteHandler;
          }
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}
export function expectSuccessEnvelope(body: unknown, expectedData: unknown): void {
  const env = body as Record<string, unknown>;
  expect(env.success).toBe(true);
  expect(env.data).toEqual(expectedData);
  expect(typeof env.correlationId).toBe('string');
  expect(typeof env.timestamp).toBe('string');
}
export function expectErrorEnvelope(body: unknown, expectedCode: string): void {
  const env = body as Record<string, unknown>;
  expect(env.success).toBe(false);
  const error = env.error as Record<string, unknown>;
  expect(error.code).toBe(expectedCode);
  expect(typeof env.correlationId).toBe('string');
}
