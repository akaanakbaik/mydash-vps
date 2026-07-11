import type { ServiceContainer } from '../infrastructure/utilities.js';
import type { Logger } from '../logging/index.js';
import { IngestMetricUseCase, GetLatestMetricsUseCase, GetMetricWindowUseCase } from '../application/usecases/monitoring.js';
import { CalculateHealthScoreUseCase, GetHealthScoreUseCase } from '../application/usecases/healthScore.js';
import { CalculateAnalyticsSummaryUseCase, GetAnalyticsSummaryUseCase } from '../application/usecases/analytics.js';
import { CreateAutomationUseCase, ListAutomationsUseCase, ExecuteAutomationUseCase, TriggerAutomationByEventUseCase, GetExecutionStatusUseCase, CancelExecutionUseCase } from '../application/usecases/automation.js';
import { DispatchNotificationsUseCase } from '../application/usecases/notification.js';
import { MetricValidatorImpl, MetricNormalizerImpl, MetricRepositoryImpl } from '../infrastructure/monitoring/index.js';
import { HealthScoreCalculator, HealthScoreRepositoryImpl } from '../infrastructure/healthScore/index.js';
import { StatisticsEngineImpl, AggregationEngineImpl, TrendAnalyzerImpl, AnomalyDetectorImpl, AnalyticsPipelineImpl, AnalyticsRepositoryImpl } from '../infrastructure/analytics/index.js';
import { TriggerEngineImpl, ConditionEngineImpl, ActionEngineImpl, WorkflowEngineImpl, WorkflowExecutorImpl, AutomationEventPublisherImpl, AutomationRepositoryImpl, AutomationExecutionRepositoryImpl } from '../infrastructure/automation/index.js';
import { NotificationRuleEngineImpl, NotificationDispatcherImpl, NotificationTemplateEngineImpl, NotificationProviderManagerImpl, NotificationRetryManagerImpl, NotificationRateLimiterImpl, NotificationDeduplicatorImpl } from '../infrastructure/notification/index.js';
import { WorkspaceRepositoryImpl, UserRepositoryImpl as WorkspaceUserRepoImpl, ServerRepositoryImpl } from '../infrastructure/workspace/repository.js';
import { BackupRepositoryImpl } from '../infrastructure/backup/repository.js';
import { AuditRepositoryImpl } from '../infrastructure/audit/repository.js';
import { SecurityRepositoryImpl } from '../infrastructure/security/repository.js';
import { ConfigurationRepositoryImpl } from '../infrastructure/configuration/repository.js';
import { PluginRepositoryImpl } from '../infrastructure/plugin/repository.js';
import { DockerRepositoryImpl } from '../infrastructure/docker/repository.js';
import { TunnelRepositoryImpl } from '../infrastructure/tunnel/repository.js';
import { GitHubDomainRepositoryImpl } from '../infrastructure/github/repository.js';
import { SessionRepositoryImpl } from '../infrastructure/auth/repository.js';
import { LoginUseCaseImpl, LogoutUseCaseImpl, ValidateSessionUseCaseImpl } from '../application/usecases/auth.impl.js';
import { CreateWorkspaceUseCaseImpl, GetWorkspaceUseCaseImpl, ListWorkspacesUseCaseImpl, DeleteWorkspaceUseCaseImpl } from '../application/usecases/workspace.impl.js';
import { CreateBackupUseCaseImpl, ListBackupsUseCaseImpl, RestoreBackupUseCaseImpl } from '../application/usecases/backup.impl.js';
import { ListPluginsUseCaseImpl, InstallPluginUseCaseImpl, GetAuditRecordsUseCaseImpl, GetSecurityEventsUseCaseImpl, GetConfigurationUseCaseImpl, UpdateConfigurationUseCaseImpl } from '../application/usecases/domains.impl.js';
import { ListServersUseCaseImpl, ListContainersUseCaseImpl, GetTunnelConfigUseCaseImpl, GetGithubReposUseCaseImpl, ListSessionsUseCaseImpl, ListRolesUseCaseImpl } from '../application/usecases/servers.impl.js';
import type { EventBus } from '../eventBus/contracts.js';
import type { CacheManager } from '../infrastructure/redis/cache.js';
import type { DrizzleClient } from '../persistence/connection.js';
import type { MetricRepository } from '../domain/monitoring/repository.js';
export function registerUseCases(container: ServiceContainer, logger: Logger): void {
  const getEventBus = () => container.resolve('eventPublisher') as EventBus;
  const getCache = () => container.resolve('redisCacheManager') as CacheManager;
  const getDb = () => container.resolve('dbClient') as DrizzleClient;
  const jwtSecret = process.env['JWT_SECRET'];
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  const metricValidator = new MetricValidatorImpl();
  const metricNormalizer = new MetricNormalizerImpl();
  const getMetricRepo = (): MetricRepository => new MetricRepositoryImpl(getDb(), logger);
  container.register('ingestMetricUseCase', () => new IngestMetricUseCase(getMetricRepo(), metricValidator, metricNormalizer, getEventBus(), getCache(), logger));
  container.register('getLatestMetricsUseCase', () => new GetLatestMetricsUseCase(getMetricRepo(), getCache(), logger));
  container.register('getMetricWindowUseCase', () => new GetMetricWindowUseCase(getMetricRepo(), logger));
  const statsEngine = new StatisticsEngineImpl();
  const getAggregator = () => new AggregationEngineImpl(statsEngine);
  const trendAnalyzer = new TrendAnalyzerImpl();
  const anomalyDetector = new AnomalyDetectorImpl(statsEngine);
  const getAnalyticsRepo = () => new AnalyticsRepositoryImpl(getDb(), logger);
  const getAnalyticsPipeline = () => new AnalyticsPipelineImpl(getMetricRepo(), getAnalyticsRepo(), getAggregator(), trendAnalyzer, anomalyDetector, getCache(), getEventBus(), logger);
  container.register('calculateAnalyticsSummaryUseCase', () => new CalculateAnalyticsSummaryUseCase(getAnalyticsPipeline(), logger));
  container.register('getAnalyticsSummaryUseCase', () => new GetAnalyticsSummaryUseCase(getAnalyticsRepo(), getCache()));
  const getHealthRepo = () => new HealthScoreRepositoryImpl(getDb());
  const getHealthCalculator = () => new HealthScoreCalculator(getMetricRepo(), getAnalyticsRepo(), logger);
  container.register('calculateHealthScoreUseCase', () => new CalculateHealthScoreUseCase(getHealthCalculator(), getHealthRepo(), getCache(), getEventBus(), logger));
  container.register('getHealthScoreUseCase', () => new GetHealthScoreUseCase(getHealthRepo(), getCache()));
  const getAutomationRepo = () => new AutomationRepositoryImpl(getDb());
  const getExecutionRepo = () => new AutomationExecutionRepositoryImpl(getDb());
  const triggerEngineFactory = () => new TriggerEngineImpl();
  const conditionEngineFactory = () => new ConditionEngineImpl();
  const actionEngineFactory = () => new ActionEngineImpl(logger);
  const workflowEngineFactory = () => new WorkflowEngineImpl();
  const eventPublisherFactory = () => new AutomationEventPublisherImpl(getEventBus(), logger);
  const getExecutor = () => new WorkflowExecutorImpl(actionEngineFactory(), workflowEngineFactory(), getExecutionRepo(), eventPublisherFactory(), logger);
  container.register('createAutomationUseCase', () => new CreateAutomationUseCase(getAutomationRepo(), logger));
  container.register('listAutomationsUseCase', () => new ListAutomationsUseCase(getAutomationRepo()));
  container.register('executeAutomationUseCase', () => new ExecuteAutomationUseCase(getAutomationRepo(), getExecutionRepo(), conditionEngineFactory(), workflowEngineFactory(), getExecutor(), logger));
  container.register('triggerAutomationByEventUseCase', () => new TriggerAutomationByEventUseCase(getAutomationRepo(), getExecutionRepo(), triggerEngineFactory(), workflowEngineFactory(), getExecutor(), logger));
  container.register('getExecutionStatusUseCase', () => new GetExecutionStatusUseCase(getExecutionRepo()));
  container.register('cancelExecutionUseCase', () => new CancelExecutionUseCase(getExecutor(), getExecutionRepo()));
  const getNotificationRuleEngine = () => new NotificationRuleEngineImpl(getMetricRepo());
  const getNotificationDispatcher = () => new NotificationDispatcherImpl(
    new NotificationProviderManagerImpl(logger),
    new NotificationTemplateEngineImpl(),
    new NotificationRateLimiterImpl(),
    new NotificationDeduplicatorImpl(),
    new NotificationRetryManagerImpl(logger),
    getMetricRepo(),
    getHealthRepo(),
    logger,
  );
  container.register('dispatchNotificationsUseCase', () => new DispatchNotificationsUseCase(getNotificationRuleEngine(), getNotificationDispatcher(), logger));
  const getUserRepo = () => new WorkspaceUserRepoImpl(getDb());
  const getSessionRepo = () => new SessionRepositoryImpl(getDb());
  container.register('loginUseCase', () => new LoginUseCaseImpl(getUserRepo(), getSessionRepo(), jwtSecret, logger));
  container.register('logoutUseCase', () => new LogoutUseCaseImpl(getSessionRepo(), logger));
  container.register('validateSessionUseCase', () => new ValidateSessionUseCaseImpl(getSessionRepo()));
  const getWorkspaceRepo = () => new WorkspaceRepositoryImpl(getDb());
  container.register('createWorkspaceUseCase', () => new CreateWorkspaceUseCaseImpl(getWorkspaceRepo(), logger));
  container.register('getWorkspaceUseCase', () => new GetWorkspaceUseCaseImpl(getWorkspaceRepo()));
  container.register('listWorkspacesUseCase', () => new ListWorkspacesUseCaseImpl(getWorkspaceRepo()));
  container.register('deleteWorkspaceUseCase', () => new DeleteWorkspaceUseCaseImpl(getWorkspaceRepo(), logger));
  const getBackupRepo = () => new BackupRepositoryImpl(getDb());
  container.register('createBackupUseCase', () => new CreateBackupUseCaseImpl(getBackupRepo(), logger));
  container.register('listBackupsUseCase', () => new ListBackupsUseCaseImpl(getBackupRepo()));
  container.register('restoreBackupUseCase', () => new RestoreBackupUseCaseImpl(getBackupRepo(), logger));
  const getPluginRepo = () => new PluginRepositoryImpl(getDb());
  container.register('listPluginsUseCase', () => new ListPluginsUseCaseImpl(getPluginRepo()));
  container.register('installPluginUseCase', () => new InstallPluginUseCaseImpl(getPluginRepo(), logger));
  const getAuditRepo = () => new AuditRepositoryImpl(getDb());
  container.register('getAuditRecordsUseCase', () => new GetAuditRecordsUseCaseImpl(getAuditRepo()));
  const getSecurityRepo = () => new SecurityRepositoryImpl(getDb());
  container.register('getSecurityEventsUseCase', () => new GetSecurityEventsUseCaseImpl(getSecurityRepo()));
  const getConfigRepo = () => new ConfigurationRepositoryImpl(getDb());
  container.register('getConfigurationUseCase', () => new GetConfigurationUseCaseImpl(getConfigRepo()));
  container.register('updateConfigurationUseCase', () => new UpdateConfigurationUseCaseImpl(getConfigRepo(), logger));
  const getServerRepo = () => new ServerRepositoryImpl(getDb());
  container.register('listServersUseCase', () => new ListServersUseCaseImpl(getServerRepo()));
  const getDockerRepo = () => new DockerRepositoryImpl(getDb());
  container.register('listContainersUseCase', () => new ListContainersUseCaseImpl(getDockerRepo()));
  const getTunnelRepo = () => new TunnelRepositoryImpl(getDb());
  container.register('getTunnelConfigUseCase', () => new GetTunnelConfigUseCaseImpl(getTunnelRepo()));
  const getGithubRepo = () => new GitHubDomainRepositoryImpl(getDb());
  container.register('getGithubReposUseCase', () => new GetGithubReposUseCaseImpl(getGithubRepo()));
  container.register('listSessionsUseCase', () => new ListSessionsUseCaseImpl(getSessionRepo()));
  container.register('listRolesUseCase', () => new ListRolesUseCaseImpl());
}
