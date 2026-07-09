import type { Logger } from '../../logging/index.js';

export abstract class BaseRepository<T, TId = string> {
  protected readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  abstract findById(id: TId): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(entity: T): Promise<T>;
  abstract update(id: TId, entity: Partial<T>): Promise<T>;
  abstract delete(id: TId): Promise<void>;
  abstract softDelete(id: TId): Promise<void>;
  abstract exists(id: TId): Promise<boolean>;
  abstract count(): Promise<number>;
}
