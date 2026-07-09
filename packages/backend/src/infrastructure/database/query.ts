export interface QueryBuilder {
  select(columns: string[]): QueryBuilder;
  from(table: string): QueryBuilder;
  where(column: string, operator: string, value: unknown): QueryBuilder;
  andWhere(column: string, operator: string, value: unknown): QueryBuilder;
  orderBy(column: string, direction: 'asc' | 'desc'): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  execute<T>(): Promise<T[]>;
  toSql(): string;
}

export interface QueryRunner {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}
