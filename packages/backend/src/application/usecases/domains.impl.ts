import type { Result, AppError, PluginManifest } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { PluginRepository } from '../../domain/plugin/index.js';
import type { AuditRepository } from '../../domain/audit/index.js';
import type { SecurityRepository } from '../../domain/security/index.js';
import type { ConfigurationRepository } from '../../domain/configuration/index.js';
import type { Logger } from '../../logging/index.js';
const listPluginsMetadata: UseCaseMetadata = {
  name: 'ListPlugins',
  description: 'List all installed and available plugins',
  category: 'Plugin',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 5000,
};
export class ListPluginsUseCaseImpl implements UseCase<void, PluginManifest[]> {
  public readonly metadata = listPluginsMetadata;
  constructor(
    private readonly repository: PluginRepository,
  ) {}
  async execute(_input: undefined, _context: UseCaseContext): Promise<Result<PluginManifest[], AppError>> {
    try {
      const plugins = await this.repository.findAll();
      return { success: true, data: plugins, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'PLUGIN_LIST_FAILED' } as AppError,
      };
    }
  }
}
const installPluginMetadata: UseCaseMetadata = {
  name: 'InstallPlugin',
  description: 'Install a plugin',
  category: 'Plugin',
  requiresAuth: true,
  idempotent: false,
  timeoutMs: 10000,
};
export class InstallPluginUseCaseImpl implements UseCase<PluginManifest, PluginManifest> {
  public readonly metadata = installPluginMetadata;
  constructor(
    private readonly repository: PluginRepository,
    private readonly logger: Logger,
  ) {}
  async execute(input: PluginManifest, context: UseCaseContext): Promise<Result<PluginManifest, AppError>> {
    try {
      const installed = { ...input };
      await this.repository.save(installed);
      this.logger.info('plugin installed', { pluginId: input.id, name: input.name, correlationId: context.correlationId });
      return { success: true, data: installed, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('plugin install failed', error, { correlationId: context.correlationId });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'PLUGIN_INSTALL_FAILED' } as AppError,
      };
    }
  }
}
const getAuditRecordsMetadata: UseCaseMetadata = {
  name: 'GetAuditRecords',
  description: 'Retrieve audit records for a workspace',
  category: 'Audit',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 5000,
};
export class GetAuditRecordsUseCaseImpl implements UseCase<{ workspaceId: string; limit?: number }, unknown[]> {
  public readonly metadata = getAuditRecordsMetadata;
  constructor(
    private readonly repository: AuditRepository,
  ) {}
  async execute(input: { workspaceId: string; limit?: number }, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    try {
      const records = await this.repository.findByWorkspaceId(input.workspaceId, input.limit ?? 50);
      return { success: true, data: records, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUDIT_LIST_FAILED' } as AppError,
      };
    }
  }
}
const getSecurityEventsMetadata: UseCaseMetadata = {
  name: 'GetSecurityEvents',
  description: 'Retrieve security events for a workspace',
  category: 'Security',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 5000,
};
export class GetSecurityEventsUseCaseImpl implements UseCase<{ workspaceId: string; limit?: number }, unknown[]> {
  public readonly metadata = getSecurityEventsMetadata;
  constructor(
    private readonly repository: SecurityRepository,
  ) {}
  async execute(input: { workspaceId: string; limit?: number }, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    try {
      const events = await this.repository.findEvents(input.workspaceId, input.limit ?? 50);
      return { success: true, data: events, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'SECURITY_LIST_FAILED' } as AppError,
      };
    }
  }
}
const getConfigurationMetadata: UseCaseMetadata = {
  name: 'GetConfiguration',
  description: 'Retrieve configuration for a workspace',
  category: 'Configuration',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 3000,
};
export class GetConfigurationUseCaseImpl implements UseCase<string, unknown> {
  public readonly metadata = getConfigurationMetadata;
  constructor(
    private readonly repository: ConfigurationRepository,
  ) {}
  async execute(workspaceId: string, _context: UseCaseContext): Promise<Result<unknown, AppError>> {
    try {
      const config = await this.repository.get(workspaceId);
      return { success: true, data: config ?? {}, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'CONFIG_GET_FAILED' } as AppError,
      };
    }
  }
}
const updateConfigurationMetadata: UseCaseMetadata = {
  name: 'UpdateConfiguration',
  description: 'Update configuration for a workspace',
  category: 'Configuration',
  requiresAuth: true,
  idempotent: false,
  timeoutMs: 5000,
};
export class UpdateConfigurationUseCaseImpl implements UseCase<{ workspaceId: string; config: unknown }, void> {
  public readonly metadata = updateConfigurationMetadata;
  constructor(
    private readonly repository: ConfigurationRepository,
    private readonly logger: Logger,
  ) {}
  async execute(input: { workspaceId: string; config: unknown }, context: UseCaseContext): Promise<Result<void, AppError>> {
    try {
      await this.repository.save(input.workspaceId, input.config as import('../../domain/configuration/index.js').AppConfig);
      this.logger.info('configuration updated', { workspaceId: input.workspaceId, correlationId: context.correlationId });
      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('configuration update failed', error, { correlationId: context.correlationId });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'CONFIG_UPDATE_FAILED' } as AppError,
      };
    }
  }
}
