import type { Metric } from '@mydash/shared';

export interface MetricCollectedEvent {
  readonly eventType: 'monitoring.metric.collected';
  readonly serverId: string;
  readonly workspaceId: string;
  readonly collectorType: string;
  readonly metricCount: number;
  readonly durationMs: number;
  readonly timestamp: Date;
}

export interface MetricValidatedEvent {
  readonly eventType: 'monitoring.metric.validated';
  readonly serverId: string;
  readonly workspaceId: string;
  readonly metricType: string;
  readonly valid: boolean;
  readonly errors: string[];
  readonly timestamp: Date;
}

export interface MetricStoredEvent {
  readonly eventType: 'monitoring.metric.stored';
  readonly serverId: string;
  readonly workspaceId: string;
  readonly metricType: string;
  readonly metricId: string;
  readonly timestamp: Date;
}

export interface MetricPublishedEvent {
  readonly eventType: 'monitoring.metric.published';
  readonly serverId: string;
  readonly workspaceId: string;
  readonly metric: Metric;
  readonly channel: string;
  readonly timestamp: Date;
}

export interface CollectorFailedEvent {
  readonly eventType: 'monitoring.collector.failed';
  readonly serverId: string;
  readonly workspaceId: string;
  readonly collectorType: string;
  readonly error: string;
  readonly timestamp: Date;
}
