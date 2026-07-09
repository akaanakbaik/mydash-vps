import type { StorageDriver, StorageConfig } from './interface.js';

export abstract class LocalStorageDriver implements StorageDriver {
  protected readonly config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  abstract read(path: string): Promise<Buffer>;
  abstract write(path: string, data: Buffer): Promise<void>;
  abstract delete(path: string): Promise<void>;
  abstract exists(path: string): Promise<boolean>;
  abstract list(path: string): Promise<string[]>;
  abstract mkdir(path: string): Promise<void>;
  abstract getSize(path: string): Promise<number>;
}
