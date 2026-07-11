import { describe, it, expect } from 'vitest';
import { success, failure } from './result.js';
describe('Result Pattern', () => {
  it('success creates a success result', () => {
    const result = success({ id: '1', name: 'test' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: '1', name: 'test' });
    expect(result.error).toBeNull();
  });
  it('failure creates a failure result', () => {
    const result = failure(new Error('Resource not found'));
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    if (result.error) {
      expect(result.error.message).toBe('Resource not found');
    }
  });
});
