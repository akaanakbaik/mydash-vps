import type { UseCase } from './base.js';
import type { HealthScore, HealthHistory } from '@mydash/shared';
import type { BackupRecord, RestoreRecord } from '@mydash/shared';
import type { DockerContainer, DockerCompose } from '@mydash/shared';
import type { TunnelConfig } from '@mydash/shared';
import type { SchedulerTask } from '@mydash/shared';
import type { Rule } from '@mydash/shared';
import type { QueueJob } from '@mydash/shared';
import type { PluginManifest } from '@mydash/shared';
export interface CalculateHealthScoreUseCase extends UseCase<string, HealthScore> {}
export interface GetHealthHistoryUseCase extends UseCase<{ serverId: string; windowMs: number }, HealthHistory[]> {}
export interface GetAnalyticsSummaryUseCase extends UseCase<{ serverId: string; window: string }, unknown> {}
export interface DetectAnomaliesUseCase extends UseCase<string, unknown[]> {}
export interface CreateBackupUseCase extends UseCase<{ serverId: string; mode: string }, BackupRecord> {}
export interface ListBackupsUseCase extends UseCase<string, BackupRecord[]> {}
export interface RestoreBackupUseCase extends UseCase<string, RestoreRecord> {}
export interface ListContainersUseCase extends UseCase<string, DockerContainer[]> {}
export interface ListComposesUseCase extends UseCase<string, DockerCompose[]> {}
export interface GetTunnelConfigUseCase extends UseCase<string, TunnelConfig | null> {}
export interface UpdateTunnelConfigUseCase extends UseCase<TunnelConfig, TunnelConfig> {}
export interface ListSchedulerTasksUseCase extends UseCase<string, SchedulerTask[]> {}
export interface CreateSchedulerTaskUseCase extends UseCase<SchedulerTask, SchedulerTask> {}
export interface ListRulesUseCase extends UseCase<string, Rule[]> {}
export interface CreateRuleUseCase extends UseCase<Rule, Rule> {}
export interface EnqueueJobUseCase extends UseCase<QueueJob, void> {}
export interface GetJobStatusUseCase extends UseCase<string, QueueJob | null> {}
export interface InstallPluginUseCase extends UseCase<PluginManifest, PluginManifest> {}
export interface ListPluginsUseCase extends UseCase<void, PluginManifest[]> {}
export interface GetSystemHealthUseCase extends UseCase<void, { uptime: number; status: string; checks: Record<string, boolean> }> {}
export interface GetAuditRecordsUseCase extends UseCase<{ workspaceId: string; limit?: number }, unknown[]> {}
export interface GetLogEntriesUseCase extends UseCase<{ level?: string; module?: string; limit?: number }, unknown[]> {}
export interface GetGithubReposUseCase extends UseCase<string, unknown[]> {}
export interface GetGithubWorkflowsUseCase extends UseCase<string, unknown[]> {}
export interface GetSecurityEventsUseCase extends UseCase<{ workspaceId: string; limit?: number }, unknown[]> {}
export interface GetConfigurationUseCase extends UseCase<string, unknown> {}
export interface UpdateConfigurationUseCase extends UseCase<{ workspaceId: string; config: unknown }, void> {}
