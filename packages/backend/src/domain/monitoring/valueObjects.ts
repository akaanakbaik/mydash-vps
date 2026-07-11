export interface MetricValidationError {
  field: string;
  message: string;
  metricType: string;
}
export interface MetricValidationResult {
  valid: boolean;
  errors: MetricValidationError[];
}
export interface NormalizationResult {
  data: Record<string, unknown>;
  unit: string;
}
export interface CollectorConfig {
  enabled: boolean;
  intervalMs: number;
  timeoutMs: number;
  retryCount: number;
}
