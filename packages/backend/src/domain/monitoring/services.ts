import type { Metric } from '@mydash/shared';
import type { MetricValidationResult } from './valueObjects.js';

export interface MetricCollector {
  readonly collectorType: string;
  collect(serverId: string, workspaceId: string): Promise<Metric[]>;
}

export interface MetricNormalizer {
  normalize(metric: Metric): Metric;
}

export interface MetricValidator {
  validate(metric: Metric): MetricValidationResult;
}

export interface MetricPipeline {
  process(serverId: string, workspaceId: string): Promise<void>;
}
