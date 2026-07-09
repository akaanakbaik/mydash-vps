import type { AppConfig } from '@mydash/shared';

export interface ConfigResolver {
  resolve(): AppConfig;
  reload(): AppConfig;
  get(key: string): unknown;
  has(key: string): boolean;
}
