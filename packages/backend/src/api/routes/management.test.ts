import { describe, it, expect, vi } from 'vitest';
import { createNotificationRouter, createAutomationRouter, createSecurityRouter, createAuditRouter, createSettingsRouter, createProfileRouter, createSessionRouter } from './management.js';

function createMockDi() {
  return { resolve: vi.fn().mockReturnValue(null) } as never;
}

describe('Management Router Factories', () => {
  it('createNotificationRouter', () => { expect(createNotificationRouter(createMockDi())).toBeDefined(); });
  it('createAutomationRouter', () => { expect(createAutomationRouter(createMockDi())).toBeDefined(); });
  it('createSecurityRouter', () => { expect(createSecurityRouter(createMockDi())).toBeDefined(); });
  it('createAuditRouter', () => { expect(createAuditRouter(createMockDi())).toBeDefined(); });
  it('createSettingsRouter', () => { expect(createSettingsRouter(createMockDi())).toBeDefined(); });
  it('createProfileRouter', () => { expect(createProfileRouter(createMockDi())).toBeDefined(); });
  it('createSessionRouter', () => { expect(createSessionRouter(createMockDi())).toBeDefined(); });
});
