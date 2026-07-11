export interface StorageDriver {
  read(path: string): Promise<Buffer>;
  write(path: string, data: Buffer): Promise<void>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  list(path: string): Promise<string[]>;
  mkdir(path: string): Promise<void>;
  getSize(path: string): Promise<number>;
}
export interface StorageConfig {
  basePath: string;
  maxFileSizeBytes: number;
  allowedExtensions: string[];
}
