import type { Repository } from '@mydash/shared';
export interface CrudRepository<T, TId = string> extends Repository<T, TId> {
  findById(id: TId): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: TId, entity: Partial<T>): Promise<T>;
  delete(id: TId): Promise<void>;
}
export type { Repository };
