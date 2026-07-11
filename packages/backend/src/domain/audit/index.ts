import type { AuditRecord } from '@mydash/shared';
export type { AuditRecord } from '@mydash/shared';
export { AuditResult } from '@mydash/shared';
export interface AuditRepository {
  save(record: AuditRecord): Promise<void>;
  findById(id: string): Promise<AuditRecord | null>;
  findByWorkspaceId(workspaceId: string, limit?: number): Promise<AuditRecord[]>;
  findByCorrelationId(correlationId: string): Promise<AuditRecord[]>;
}
