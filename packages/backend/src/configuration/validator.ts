import type { AppConfig } from '@mydash/shared';
export interface ConfigValidator {
  validate(config: AppConfig): ConfigValidationResult;
}
export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}
export interface ConfigValidationError {
  path: string;
  message: string;
  value: unknown;
}
export interface ConfigValidationWarning {
  path: string;
  message: string;
}
