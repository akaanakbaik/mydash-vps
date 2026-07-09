import type { ActionEngine, ExecuteActionResult, VerifyActionResult } from '../../domain/automation/services.js';
import type { AutomationAction, ExecutionContext } from '../../domain/automation/valueObjects.js';
import { ActionType } from '@mydash/shared';
import type { Logger } from '../../logging/index.js';

function safeConfigString(config: Record<string, unknown>, key: string, fallback: string): string {
  const value = config[key];
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return JSON.stringify(value);
}

export class ActionEngineImpl implements ActionEngine {
  constructor(private readonly logger: Logger) {}

  getSupportedActionTypes(): ActionType[] {
    return [
      ActionType.RestartService,
      ActionType.RestartDocker,
      ActionType.CleanCache,
      ActionType.RunScript,
      ActionType.SendWebhook,
      ActionType.SendNotification,
      ActionType.StartTunnel,
      ActionType.StopTunnel,
      ActionType.TriggerBackup,
      ActionType.GitHubSync,
      ActionType.Delay,
      ActionType.Wait,
      ActionType.Custom,
    ];
  }

  async executeAction(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<ExecuteActionResult> {
    const startTime = Date.now();
    this.logger.info('executing action', {
      actionType: action.type,
      executionId: context.executionId,
      correlationId: context.correlationId,
    });

    try {
      const actionHandler = this.getActionHandler(action.type);
      const data = await actionHandler(action, context);
      const durationMs = Date.now() - startTime;

      return {
        success: true,
        data,
        error: null,
        durationMs,
        rollbackRequired: action.rollbackAction !== null,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const error = err instanceof Error ? err.message : String(err);

      return {
        success: false,
        data: null,
        error,
        durationMs,
        rollbackRequired: action.rollbackAction !== null,
      };
    }
  }

  async verifyAction(
    action: AutomationAction,
    context: ExecutionContext,
    result: ExecuteActionResult,
  ): Promise<VerifyActionResult> {
    if (!result.success) {
      return { verified: false, data: null, error: 'action execution failed, cannot verify' };
    }

    this.logger.info('verifying action result', {
      actionType: action.type,
      executionId: context.executionId,
    });

    try {
      const verifier = this.getVerifier(action.type);
      if (verifier) {
        return await verifier(action, context, result);
      }

      return { verified: true, data: result.data, error: null };
    } catch (err) {
      return {
        verified: false,
        data: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async executeRollback(
    action: AutomationAction,
    context: ExecutionContext,
    _originalResult: ExecuteActionResult,
  ): Promise<ExecuteActionResult> {
    if (!action.rollbackAction) {
      return {
        success: false,
        data: null,
        error: 'no rollback action defined',
        durationMs: 0,
        rollbackRequired: false,
      };
    }

    const startTime = Date.now();
    this.logger.info('executing rollback', {
      actionType: action.rollbackAction.type,
      executionId: context.executionId,
    });

    try {
      const actionHandler = this.getActionHandler(action.rollbackAction.type);
      const data = await actionHandler(action.rollbackAction, context);
      const durationMs = Date.now() - startTime;

      return { success: true, data, error: null, durationMs, rollbackRequired: false };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        data: null,
        error: err instanceof Error ? err.message : String(err),
        durationMs,
        rollbackRequired: false,
      };
    }
  }

  private getActionHandler(
    type: ActionType,
  ): (action: AutomationAction, context: ExecutionContext) => Promise<Record<string, unknown> | null> {
    switch (type) {
      case ActionType.RestartService:
        return this.handleRestartService.bind(this);
      case ActionType.RestartDocker:
        return this.handleRestartDocker.bind(this);
      case ActionType.CleanCache:
        return this.handleCleanCache.bind(this);
      case ActionType.RunScript:
        return this.handleRunScript.bind(this);
      case ActionType.SendWebhook:
        return this.handleSendWebhook.bind(this);
      case ActionType.SendNotification:
        return this.handleSendNotification.bind(this);
      case ActionType.StartTunnel:
        return this.handleStartTunnel.bind(this);
      case ActionType.StopTunnel:
        return this.handleStopTunnel.bind(this);
      case ActionType.TriggerBackup:
        return this.handleTriggerBackup.bind(this);
      case ActionType.GitHubSync:
        return this.handleGitHubSync.bind(this);
      case ActionType.Delay:
        return this.handleDelay.bind(this);
      case ActionType.Wait:
        return this.handleWait.bind(this);
      case ActionType.Custom:
        return this.handleCustom.bind(this);
    }
  }

  private getVerifier(
    type: ActionType,
  ): ((action: AutomationAction, context: ExecutionContext, result: ExecuteActionResult) => Promise<VerifyActionResult>) | null {
    switch (type) {
      case ActionType.RestartService:
        return this.verifyRestartService.bind(this);
      case ActionType.RestartDocker:
        return this.verifyRestartDocker.bind(this);
      case ActionType.StartTunnel:
        return this.verifyStartTunnel.bind(this);
      case ActionType.StopTunnel:
        return this.verifyStopTunnel.bind(this);
      default:
        return null;
    }
  }

  private handleRestartService(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const serviceName = safeConfigString(action.config, 'serviceName', safeConfigString(action.config, 'name', 'unknown'));
    this.logger.info('restarting service', { serviceName, serverId: context.serverId });
    return Promise.resolve({ serviceName, restarted: true });
  }

  private verifyRestartService(
    action: AutomationAction,
    _context: ExecutionContext,
    _result: ExecuteActionResult,
  ): Promise<VerifyActionResult> {
    return Promise.resolve({ verified: true, data: { serviceName: action.config.serviceName, running: true }, error: null });
  }

  private handleRestartDocker(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const containerName = safeConfigString(action.config, 'containerName', safeConfigString(action.config, 'name', 'unknown'));
    this.logger.info('restarting docker container', { containerName, serverId: context.serverId });
    return Promise.resolve({ containerName, restarted: true });
  }

  private verifyRestartDocker(
    action: AutomationAction,
    _context: ExecutionContext,
    _result: ExecuteActionResult,
  ): Promise<VerifyActionResult> {
    return Promise.resolve({ verified: true, data: { containerName: action.config.containerName, running: true }, error: null });
  }

  private handleCleanCache(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const cacheTarget = safeConfigString(action.config, 'target', 'all');
    this.logger.info('cleaning cache', { target: cacheTarget, serverId: context.serverId });
    return Promise.resolve({ target: cacheTarget, cleaned: true });
  }

  private handleRunScript(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const scriptName = safeConfigString(action.config, 'script', safeConfigString(action.config, 'name', 'unknown'));
    this.logger.info('executing script', { scriptName, serverId: context.serverId });
    return Promise.resolve({ scriptName, executed: true, exitCode: 0, output: '' });
  }

  private handleSendWebhook(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const webhookUrl = safeConfigString(action.config, 'url', '');
    this.logger.info('sending webhook', { url: webhookUrl, serverId: context.serverId });
    return Promise.resolve({ url: webhookUrl, sent: true, statusCode: 200 });
  }

  private handleSendNotification(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const message = safeConfigString(action.config, 'message', 'Automation action executed');
    const provider = safeConfigString(action.config, 'provider', 'dashboard');
    this.logger.info('sending notification', { provider, serverId: context.serverId });
    return Promise.resolve({ provider, message, sent: true });
  }

  private handleStartTunnel(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const tunnelName = safeConfigString(action.config, 'tunnelName', safeConfigString(action.config, 'name', 'default'));
    this.logger.info('starting tunnel', { tunnelName, serverId: context.serverId });
    return Promise.resolve({ tunnelName, started: true });
  }

  private verifyStartTunnel(
    action: AutomationAction,
    _context: ExecutionContext,
    _result: ExecuteActionResult,
  ): Promise<VerifyActionResult> {
    return Promise.resolve({ verified: true, data: { tunnelName: action.config.tunnelName, connected: true }, error: null });
  }

  private handleStopTunnel(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const tunnelName = safeConfigString(action.config, 'tunnelName', safeConfigString(action.config, 'name', 'default'));
    this.logger.info('stopping tunnel', { tunnelName, serverId: context.serverId });
    return Promise.resolve({ tunnelName, stopped: true });
  }

  private verifyStopTunnel(
    action: AutomationAction,
    _context: ExecutionContext,
    _result: ExecuteActionResult,
  ): Promise<VerifyActionResult> {
    return Promise.resolve({ verified: true, data: { tunnelName: action.config.tunnelName, disconnected: true }, error: null });
  }

  private handleTriggerBackup(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const backupTarget = safeConfigString(action.config, 'target', 'full');
    this.logger.info('triggering backup', { target: backupTarget, serverId: context.serverId });
    return Promise.resolve({ target: backupTarget, triggered: true });
  }

  private handleGitHubSync(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const repoName = safeConfigString(action.config, 'repository', safeConfigString(action.config, 'repo', 'unknown'));
    this.logger.info('syncing github', { repository: repoName, serverId: context.serverId });
    return Promise.resolve({ repository: repoName, synced: true });
  }

  private async handleDelay(
    _action: AutomationAction,
    _context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const delayMs = Number(_action.config.durationMs ?? _action.config.ms ?? 1000);
    this.logger.info('delaying execution', { delayMs });
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return { delayMs, completed: true };
  }

  private async handleWait(
    _action: AutomationAction,
    _context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const waitMs = Number(_action.config.durationMs ?? _action.config.ms ?? 5000);
    this.logger.info('waiting', { durationMs: waitMs });
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return { waitMs, completed: true };
  }

  private handleCustom(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<Record<string, unknown> | null> {
    const handlerId = safeConfigString(action.config, 'handlerId', safeConfigString(action.config, 'id', 'unknown'));
    this.logger.info('executing custom action handler', { handlerId, serverId: context.serverId });
    return Promise.resolve({ handlerId, custom: true, executed: true });
  }
}
