export type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
export { createUseCaseContext } from './base.js';

export type { LoginUseCase, LogoutUseCase, ValidateSessionUseCase } from './auth.js';
export type { CreateWorkspaceUseCase, GetWorkspaceUseCase, ListWorkspacesUseCase, DeleteWorkspaceUseCase } from './workspace.js';
export type { IngestMetricUseCase, GetLatestMetricsUseCase, GetMetricWindowUseCase } from './monitoring.js';
export { IngestMetricUseCase as IngestMetricUseCaseImpl, GetLatestMetricsUseCase as GetLatestMetricsUseCaseImpl, GetMetricWindowUseCase as GetMetricWindowUseCaseImpl } from './monitoring.js';
export type { DispatchNotificationsUseCase } from './notification.js';
export { DispatchNotificationsUseCase as DispatchNotificationsUseCaseImpl } from './notification.js';
export type { CreateAutomationUseCase, ListAutomationsUseCase, ExecuteAutomationUseCase } from './automation.js';
export { CreateAutomationUseCase as CreateAutomationUseCaseImpl, ListAutomationsUseCase as ListAutomationsUseCaseImpl, ExecuteAutomationUseCase as ExecuteAutomationUseCaseImpl, TriggerAutomationByEventUseCase as TriggerAutomationByEventUseCaseImpl, GetExecutionStatusUseCase as GetExecutionStatusUseCaseImpl, CancelExecutionUseCase as CancelExecutionUseCaseImpl } from './automation.js';
export type { CalculateAnalyticsSummaryUseCase, GetAnalyticsSummaryUseCase } from './analytics.js';
export { CalculateAnalyticsSummaryUseCase as CalculateAnalyticsSummaryUseCaseImpl, GetAnalyticsSummaryUseCase as GetAnalyticsSummaryUseCaseImpl } from './analytics.js';
export type { CalculateHealthScoreUseCase, GetHealthScoreUseCase } from './healthScore.js';
export { CalculateHealthScoreUseCase as CalculateHealthScoreUseCaseImpl, GetHealthScoreUseCase as GetHealthScoreUseCaseImpl } from './healthScore.js';
export type {
  GetHealthHistoryUseCase,
  DetectAnomaliesUseCase,
  CreateBackupUseCase,
  ListBackupsUseCase,
  RestoreBackupUseCase,
  ListContainersUseCase,
  ListComposesUseCase,
  GetTunnelConfigUseCase,
  UpdateTunnelConfigUseCase,
  ListSchedulerTasksUseCase,
  CreateSchedulerTaskUseCase,
  ListRulesUseCase,
  CreateRuleUseCase,
  EnqueueJobUseCase,
  GetJobStatusUseCase,
  InstallPluginUseCase,
  ListPluginsUseCase,
  GetSystemHealthUseCase,
  GetAuditRecordsUseCase,
  GetLogEntriesUseCase,
  GetGithubReposUseCase,
  GetGithubWorkflowsUseCase,
  GetSecurityEventsUseCase,
  GetConfigurationUseCase,
  UpdateConfigurationUseCase,
} from './domains.js';

export {
  LoginUseCaseImpl,
  LogoutUseCaseImpl,
  ValidateSessionUseCaseImpl,
} from './auth.impl.js';
export {
  CreateWorkspaceUseCaseImpl,
  GetWorkspaceUseCaseImpl,
  ListWorkspacesUseCaseImpl,
  DeleteWorkspaceUseCaseImpl,
} from './workspace.impl.js';
export {
  CreateBackupUseCaseImpl,
  ListBackupsUseCaseImpl,
  RestoreBackupUseCaseImpl,
} from './backup.impl.js';
export {
  ListPluginsUseCaseImpl,
  InstallPluginUseCaseImpl,
  GetAuditRecordsUseCaseImpl,
  GetSecurityEventsUseCaseImpl,
  GetConfigurationUseCaseImpl,
  UpdateConfigurationUseCaseImpl,
} from './domains.impl.js';
