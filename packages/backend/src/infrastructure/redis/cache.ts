export interface CacheManager {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): CacheStats;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number;
  keyCount: number;
}
