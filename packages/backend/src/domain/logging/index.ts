import type { LogEntry } from '@mydash/shared';

export type { LogEntry } from '@mydash/shared';
export { LogLevel } from '@mydash/shared';

export interface LogRepository {
  save(entry: LogEntry): Promise<void>;
  findByCorrelationId(correlationId: string): Promise<LogEntry[]>;
  query(params: { level?: string; module?: string; from?: Date; to?: Date; limit?: number }): Promise<LogEntry[]>;
}
