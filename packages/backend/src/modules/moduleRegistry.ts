import type { Logger } from '../logging/index.js';
import type { AppConfig } from '@mydash/shared';
export enum ModuleStatus {
  Uninitialized = 'uninitialized',
  Initializing = 'initializing',
  Ready = 'ready',
  Degraded = 'degraded',
  Failed = 'failed',
}
export interface ModuleDefinition {
  name: string;
  dependsOn: string[];
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<boolean>;
  status: ModuleStatus;
}
export interface ModuleRegistry {
  register(module: ModuleDefinition): void;
  resolveAll(): Promise<void>;
  shutdownAll(): Promise<void>;
  getModule(name: string): ModuleDefinition | undefined;
  getDependencyGraph(): Map<string, string[]>;
  getStatus(): Map<string, ModuleStatus>;
}
export function createModuleRegistry(_logger: Logger, _config: AppConfig): ModuleRegistry {
  const logger = _logger;
  const modules = new Map<string, ModuleDefinition>();
  const startupOrder: string[] = [];
  const resolved = new Set<string>();
  function resolveModule(name: string, visited: Set<string>): void {
    if (resolved.has(name)) return;
    if (visited.has(name)) {
      throw new Error(`Circular dependency detected: ${[...visited, name].join(' -> ')}`);
    }
    const module = modules.get(name);
    if (!module) {
      throw new Error(`Module not found: ${name}`);
    }
    visited.add(name);
    for (const dep of module.dependsOn) {
      resolveModule(dep, visited);
    }
    startupOrder.push(name);
    resolved.add(name);
  }
  return {
    register(module: ModuleDefinition): void {
      modules.set(module.name, module);
    },
    async resolveAll(): Promise<void> {
      for (const name of modules.keys()) {
        resolveModule(name, new Set());
      }
      for (const name of startupOrder) {
        const module = modules.get(name);
        if (module) {
          logger.info(`Initializing module: ${name}`);
          module.status = ModuleStatus.Initializing;
          await module.initialize();
          module.status = ModuleStatus.Ready;
          logger.success(`Module ready: ${name}`);
        }
      }
    },
    async shutdownAll(): Promise<void> {
      for (const name of [...startupOrder].reverse()) {
        const module = modules.get(name);
        if (module) {
          logger.info(`Shutting down module: ${name}`);
          await module.shutdown();
          module.status = ModuleStatus.Uninitialized;
        }
      }
    },
    getModule(name: string): ModuleDefinition | undefined {
      return modules.get(name);
    },
    getDependencyGraph(): Map<string, string[]> {
      const graph = new Map<string, string[]>();
      for (const [name, module] of modules) {
        graph.set(name, [...module.dependsOn]);
      }
      return graph;
    },
    getStatus(): Map<string, ModuleStatus> {
      const status = new Map<string, ModuleStatus>();
      for (const [name, module] of modules) {
        status.set(name, module.status);
      }
      return status;
    },
  };
}
