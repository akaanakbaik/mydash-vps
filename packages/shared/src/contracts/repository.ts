export interface Repository<T, TId = string> {
  findById(id: TId): Promise<T | null>;
  findAll(params?: RepositoryQueryParams): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: TId, entity: Partial<T>): Promise<T>;
  delete(id: TId): Promise<void>;
  softDelete(id: TId): Promise<void>;
  exists(id: TId): Promise<boolean>;
  count(params?: RepositoryQueryParams): Promise<number>;
}

export interface RepositoryQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}
