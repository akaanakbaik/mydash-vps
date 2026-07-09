import type { Result } from '../patterns/result.js';
import type { AppError } from '../errors/appError.js';

export interface Validator<T> {
  validate(input: unknown): Result<T, AppError>;
}

export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
  message: string;
}

export interface ValidationSchema<T> {
  rules: ValidationRule<T>[];
  validate(input: Record<string, unknown>): Result<T, AppError>;
}
