import type { RestoreRecord } from '@mydash/shared';

export type { RestoreRecord } from '@mydash/shared';
export { RestoreMode } from '@mydash/shared';

export interface RestoreRepository {
  save(record: RestoreRecord): Promise<void>;
  findById(id: string): Promise<RestoreRecord | null>;
  findByWorkspaceId(workspaceId: string): Promise<RestoreRecord[]>;
}
