export interface PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMs: number;
}

export interface PoolManager {
  connect(config: PoolConfig): Promise<void>;
  disconnect(): Promise<void>;
  getPool(): unknown;
  healthCheck(): Promise<boolean>;
}
