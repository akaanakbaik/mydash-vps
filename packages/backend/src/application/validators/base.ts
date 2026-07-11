import type { Result } from '@mydash/shared';
import type { AppError } from '@mydash/shared';
export interface ApplicationValidator<TInput, TOutput> {
  validate(input: TInput): Result<TOutput, AppError>;
}
export interface AsyncValidator<TInput, TOutput> {
  validate(input: TInput): Promise<Result<TOutput, AppError>>;
}
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value: unknown;
}
