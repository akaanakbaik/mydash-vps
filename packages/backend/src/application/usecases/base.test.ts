import { describe, it, expect } from 'vitest';
import { createUseCaseContext, type UseCaseContext, type UseCaseMetadata } from './base.js';

describe('UseCaseContext', () => {
  it('can be created with correlationId and workspaceId', () => {
    const ctx = createUseCaseContext({ correlationId: 'corr-abc', workspaceId: 'ws-xyz' });
    const typed: UseCaseContext = ctx;
    expect(typed.correlationId).toBe('corr-abc');
    expect(typed.workspaceId).toBe('ws-xyz');
    expect(typed.userId).toBeNull();
    expect(typed.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe('UseCaseMetadata', () => {
  it('can be typed with all required fields', () => {
    const meta: UseCaseMetadata = {
      name: 'TestUseCase',
      description: 'A test use case',
      category: 'Testing',
      requiresAuth: true,
      idempotent: false,
      timeoutMs: 5000,
    };
    expect(meta.name).toBe('TestUseCase');
    expect(meta.requiresAuth).toBe(true);
    expect(meta.timeoutMs).toBe(5000);
  });
});
