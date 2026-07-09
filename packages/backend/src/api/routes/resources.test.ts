import { describe, it, expect, vi } from 'vitest';
import { createServersRouter, createBackupRouter, createDockerRouter, createTunnelRouter, createGitHubRouter, createPluginRouter } from './resources.js';

function createMockDi() {
  return { resolve: vi.fn().mockReturnValue(null) } as never;
}

describe('createServersRouter', () => {
  it('should return a router', () => { const r = createServersRouter(createMockDi()); expect(r).toBeDefined(); });
});

describe('createBackupRouter', () => {
  it('should return a router', () => { const r = createBackupRouter(createMockDi()); expect(r).toBeDefined(); });
});

describe('createDockerRouter', () => {
  it('should return a router', () => { const r = createDockerRouter(createMockDi()); expect(r).toBeDefined(); });
});

describe('createTunnelRouter', () => {
  it('should return a router', () => { const r = createTunnelRouter(createMockDi()); expect(r).toBeDefined(); });
});

describe('createGitHubRouter', () => {
  it('should return a router', () => { const r = createGitHubRouter(createMockDi()); expect(r).toBeDefined(); });
});

describe('createPluginRouter', () => {
  it('should return a router', () => { const r = createPluginRouter(createMockDi()); expect(r).toBeDefined(); });
});
