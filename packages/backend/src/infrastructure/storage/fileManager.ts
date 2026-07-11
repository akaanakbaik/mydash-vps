export interface FileManager {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  readJson<T>(path: string): Promise<T>;
  writeJson(path: string, data: unknown): Promise<void>;
  ensureDirectory(path: string): Promise<void>;
  cleanup(path: string, olderThanMs: number): Promise<void>;
  getDiskUsage(path: string): Promise<DiskUsage>;
}
export interface DiskUsage {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usedPercent: number;
}
