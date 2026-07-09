import { describe, it, expect } from 'vitest';
import { AppError } from './appError.js';

describe('AppError', () => {
  it('creates an error with code, message, statusCode, severity, and correlationId', () => {
    const err = new AppError({
      code: 'ERR_TEST',
      message: 'Something went wrong',
      statusCode: 500,
      severity: 'error',
      correlationId: 'corr-123',
    });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('ERR_TEST');
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.severity).toBe('error');
    expect(err.correlationId).toBe('corr-123');
  });

  it('preserves stack trace', () => {
    const err = new AppError({
      code: 'ERR_STACK',
      message: 'Stack test',
      statusCode: 500,
      severity: 'error',
      correlationId: 'corr-456',
    });
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('AppError');
  });

  it('defaults optional details to undefined', () => {
    const err = new AppError({
      code: 'ERR_NO_DETAILS',
      message: 'No details',
      statusCode: 400,
      severity: 'warning',
      correlationId: 'corr-789',
    });
    expect(err.details).toBeNull();
  });
});
