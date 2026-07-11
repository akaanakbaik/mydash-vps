import { describe, it, expect, vi } from 'vitest';
import { createAuthRouter, createRolesRouter } from './auth.js';
describe('createAuthRouter', () => {
  it('should return a router instance', () => {
    const router = createAuthRouter({ resolve: vi.fn() });
    expect(router).toBeDefined();
    expect(typeof router.use).toBe('function');
    expect(typeof router.get).toBe('function');
    expect(typeof router.post).toBe('function');
  });
});
describe('createRolesRouter', () => {
  it('should return a router instance', () => {
    const router = createRolesRouter({ resolve: vi.fn() });
    expect(router).toBeDefined();
    expect(typeof router.get).toBe('function');
  });
});
