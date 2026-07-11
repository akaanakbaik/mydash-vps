import { describe, it, expect, vi } from 'vitest';
describe('Logger Interface', () => {
  it('calls info with message and metadata', () => {
    const mockLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    mockLogger.info('test message', { key: 'value' });
    expect(mockLogger.info).toHaveBeenCalledWith('test message', { key: 'value' });
  });
  it('calls error with error object', () => {
    const mockLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    const err = new Error('Something broke');
    mockLogger.error('operation failed', err);
    expect(mockLogger.error).toHaveBeenCalledWith('operation failed', err);
  });
  it('calls warn with context', () => {
    const mockLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    mockLogger.warn('threshold exceeded', { value: 95 });
    expect(mockLogger.warn).toHaveBeenCalledWith('threshold exceeded', { value: 95 });
  });
  it('calls debug with details', () => {
    const mockLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    mockLogger.debug('pipeline started', { serverId: 'srv-1' });
    expect(mockLogger.debug).toHaveBeenCalledWith('pipeline started', { serverId: 'srv-1' });
  });
});
