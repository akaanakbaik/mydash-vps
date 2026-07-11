export interface DistributedLock {
  acquire(key: string, ttlMs: number): Promise<boolean>;
  release(key: string): Promise<void>;
  extend(key: string, ttlMs: number): Promise<boolean>;
  isLocked(key: string): Promise<boolean>;
}
export interface LockOptions {
  key: string;
  ttlMs: number;
  retryCount: number;
  retryDelayMs: number;
}
