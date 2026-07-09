export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
  isConnected(): boolean;
}

export interface DatabaseClient extends DatabaseConnection {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}
