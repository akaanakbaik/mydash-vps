import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, validatePasswordPolicy } from './passwordService.js';

describe('hashPassword', () => {
  it('should hash a password successfully', async () => {
    const hash = await hashPassword('TestPassword123!');
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should produce different hashes for the same password', async () => {
    const hash1 = await hashPassword('TestPassword123!');
    const hash2 = await hashPassword('TestPassword123!');
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('should verify correct password', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const hash = await hashPassword('TestPassword123!');
    const isValid = await verifyPassword('WrongPassword', hash);
    expect(isValid).toBe(false);
  });
});

describe('validatePasswordPolicy', () => {
  it('should accept strong password', () => {
    const result = validatePasswordPolicy('StrongPass123!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject short password', () => {
    const result = validatePasswordPolicy('Short1A!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('12 characters'))).toBe(true);
  });

  it('should reject password without uppercase', () => {
    const result = validatePasswordPolicy('weakpassword123!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
  });

  it('should reject password without lowercase', () => {
    const result = validatePasswordPolicy('UPPERCASE123!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
  });

  it('should reject password without number', () => {
    const result = validatePasswordPolicy('NoNumbersHere!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('number'))).toBe(true);
  });

  it('should reject password without special character', () => {
    const result = validatePasswordPolicy('NoSpecialChar123');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('special'))).toBe(true);
  });
});
