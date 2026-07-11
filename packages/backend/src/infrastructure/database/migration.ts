export interface Migration {
  id: string;
  name: string;
  version: number;
  dependsOn: string[];
  up(): Promise<void>;
  down(): Promise<void>;
}
export interface MigrationRunner {
  register(migration: Migration): void;
  runAll(): Promise<void>;
  rollback(version: number): Promise<void>;
  getStatus(): Map<string, MigrationStatus>;
}
export enum MigrationStatus {
  Pending = 'pending',
  Running = 'running',
  Applied = 'applied',
  Failed = 'failed',
}
