export type WorkflowStatus = 'active' | 'paused' | 'failed' | 'completed' | 'draft';
export type TriggerType = 'monitoring' | 'analytics' | 'health_score' | 'notification' | 'manual' | 'schedule' | 'webhook';
export type ActionType = 'restart_service' | 'restart_docker' | 'restart_tunnel' | 'run_script' | 'webhook' | 'send_notification' | 'backup' | 'github_sync' | 'delay' | 'wait' | 'custom';
export type ExecutionStatus = 'running' | 'success' | 'failed' | 'pending' | 'cancelled' | 'skipped';
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  triggerLabel: string;
  actions: ActionType[];
  actionLabels: string[];
  lastRun: string | null;
  nextRun: string | null;
  runCount: number;
  successRate: number;
  avgDuration: number;
}
export interface Execution {
  id: number;
  workflowId: string;
  workflowName: string;
  trigger: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string | null;
  duration: number;
  actions: number;
  actionsCompleted: number;
  errorMessage: string | null;
  triggeredBy: string;
}
export interface TriggerInfo {
  type: TriggerType;
  label: string;
  description: string;
  enabled: boolean;
  config: string;
}
export interface ActionInfo {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
}
export interface QueueStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  throughput: number;
  avgWaitTime: number;
}
export interface RetryPolicy {
  enabled: boolean;
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  totalRetries: number;
  successRate: number;
}
export interface RollbackInfo {
  enabled: boolean;
  strategies: string[];
  rollbacksPerformed: number;
  rollbackSuccessRate: number;
  lastRollback: string | null;
}
export interface ScheduleInfo {
  type: string;
  cron: string;
  timezone: string;
  nextRun: string;
  lastRun: string;
}
export interface TimelinePoint {
  timestamp: string;
  running: number;
  success: number;
  failed: number;
}
export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  workflowName: string;
}
export interface AutomationData {
  summary: {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    failedToday: number;
    avgDuration: number;
  };
  workflows: Workflow[];
  triggers: TriggerInfo[];
  actions: ActionInfo[];
  executions: Execution[];
  queue: QueueStats;
  retry: RetryPolicy;
  rollback: RollbackInfo;
  scheduler: ScheduleInfo;
  timeline: TimelinePoint[];
  activity: ActivityItem[];
  filterCategories: { id: string; label: string }[];
}
function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60000).toISOString();
}
export function getMockAutomationData(): AutomationData {
  return {
    summary: {
      totalWorkflows: 12,
      activeWorkflows: 8,
      totalExecutions: 1248,
      successRate: 94.2,
      failedToday: 2,
      avgDuration: 45,
    },
    workflows: [
      { id: 'w1', name: 'CPU Throttle Response', description: 'Restart services when CPU exceeds 90% for 5 minutes', status: 'active', trigger: 'monitoring', triggerLabel: 'Monitoring Trigger', actions: ['send_notification', 'delay', 'restart_service'], actionLabels: ['Send Notification', 'Delay 30s', 'Restart Service'], lastRun: minutesAgo(15), nextRun: null, runCount: 42, successRate: 95.2, avgDuration: 35 },
      { id: 'w2', name: 'Disk Cleanup Routine', description: 'Run cleanup script when disk usage exceeds 85%', status: 'active', trigger: 'monitoring', triggerLabel: 'Monitoring Trigger', actions: ['send_notification', 'run_script'], actionLabels: ['Send Notification', 'Run Cleanup Script'], lastRun: minutesAgo(120), nextRun: null, runCount: 18, successRate: 88.9, avgDuration: 120 },
      { id: 'w3', name: 'Tunnel Recovery', description: 'Restart tunnel on disconnect with notification', status: 'active', trigger: 'health_score', triggerLabel: 'Health Score Trigger', actions: ['send_notification', 'restart_tunnel'], actionLabels: ['Send Notification', 'Restart Tunnel'], lastRun: minutesAgo(240), nextRun: null, runCount: 7, successRate: 100, avgDuration: 15 },
      { id: 'w4', name: 'Weekly Backup', description: 'Full system backup every Sunday at 02:00', status: 'active', trigger: 'schedule', triggerLabel: 'Schedule Trigger', actions: ['send_notification', 'backup', 'send_notification'], actionLabels: ['Notify Starting', 'Run Backup', 'Notify Complete'], lastRun: minutesAgo(2880), nextRun: minutesAgo(-5760), runCount: 52, successRate: 98.1, avgDuration: 300 },
      { id: 'w5', name: 'GitHub Sync', description: 'Sync configuration to GitHub repository on changes', status: 'active', trigger: 'webhook', triggerLabel: 'Webhook Trigger', actions: ['github_sync', 'send_notification'], actionLabels: ['GitHub Sync', 'Send Notification'], lastRun: minutesAgo(60), nextRun: null, runCount: 156, successRate: 99.4, avgDuration: 45 },
      { id: 'w6', name: 'Memory Pressure Alert', description: 'Alert and restart containers on memory pressure', status: 'paused', trigger: 'analytics', triggerLabel: 'Analytics Trigger', actions: ['send_notification', 'restart_docker'], actionLabels: ['Send Notification', 'Restart Docker'], lastRun: minutesAgo(1440), nextRun: null, runCount: 23, successRate: 91.3, avgDuration: 60 },
      { id: 'w7', name: 'Manual Maintenance Mode', description: 'Manual workflow to enable maintenance mode', status: 'draft', trigger: 'manual', triggerLabel: 'Manual Trigger', actions: ['send_notification', 'run_script', 'wait', 'run_script'], actionLabels: ['Notify Users', 'Enable Maintenance', 'Wait 5m', 'Run Updates'], lastRun: null, nextRun: null, runCount: 0, successRate: 0, avgDuration: 0 },
      { id: 'w8', name: 'Docker Health Check', description: 'Restart unhealthy containers automatically', status: 'active', trigger: 'notification', triggerLabel: 'Notification Trigger', actions: ['restart_docker', 'send_notification'], actionLabels: ['Restart Container', 'Send Notification'], lastRun: minutesAgo(480), nextRun: null, runCount: 5, successRate: 80, avgDuration: 20 },
    ],
    triggers: [
      { type: 'monitoring', label: 'Monitoring Trigger', description: 'Triggered when monitoring metrics cross thresholds', enabled: true, config: 'CPU > 90% for 5m' },
      { type: 'analytics', label: 'Analytics Trigger', description: 'Triggered by analytics trend detection or anomaly', enabled: true, config: 'Memory trend increasing 10%/h' },
      { type: 'health_score', label: 'Health Score Trigger', description: 'Triggered when health score drops below threshold', enabled: true, config: 'Score < 70 for 2 consecutive checks' },
      { type: 'notification', label: 'Notification Trigger', description: 'Triggered by notification delivery failures', enabled: true, config: 'Delivery failure rate > 5%' },
      { type: 'manual', label: 'Manual Trigger', description: 'Manually triggered by user from dashboard', enabled: true, config: 'User-initiated' },
      { type: 'schedule', label: 'Schedule Trigger', description: 'Triggered on a cron schedule', enabled: true, config: '0 2 * * 0 (Weekly Sunday 02:00)' },
      { type: 'webhook', label: 'Webhook Trigger', description: 'Triggered by incoming webhook from external service', enabled: true, config: 'POST /webhook/github-sync' },
    ],
    actions: [
      { type: 'restart_service', label: 'Restart Service', description: 'Restart a system service', icon: 'RefreshCw' },
      { type: 'restart_docker', label: 'Restart Docker', description: 'Restart a Docker container', icon: 'Container' },
      { type: 'restart_tunnel', label: 'Restart Tunnel', description: 'Restart tunnel connection', icon: 'Globe' },
      { type: 'run_script', label: 'Run Script', description: 'Execute a custom script', icon: 'Terminal' },
      { type: 'webhook', label: 'Webhook', description: 'Send an outgoing webhook', icon: 'Webhook' },
      { type: 'send_notification', label: 'Send Notification', description: 'Send notification via configured providers', icon: 'Bell' },
      { type: 'backup', label: 'Backup', description: 'Create a system backup', icon: 'HardDrive' },
      { type: 'github_sync', label: 'GitHub Sync', description: 'Sync with GitHub repository', icon: 'GitBranch' },
      { type: 'delay', label: 'Delay', description: 'Wait for a specified duration', icon: 'Clock' },
      { type: 'wait', label: 'Wait', description: 'Pause and wait for condition', icon: 'Timer' },
      { type: 'custom', label: 'Custom Action', description: 'User-defined custom action', icon: 'Zap' },
    ],
    executions: [
      { id: 1, workflowId: 'w1', workflowName: 'CPU Throttle Response', trigger: 'monitoring', status: 'success', startedAt: minutesAgo(15), completedAt: minutesAgo(14), duration: 32, actions: 3, actionsCompleted: 3, errorMessage: null, triggeredBy: 'automation-engine' },
      { id: 2, workflowId: 'w5', workflowName: 'GitHub Sync', trigger: 'webhook', status: 'success', startedAt: minutesAgo(60), completedAt: minutesAgo(59), duration: 42, actions: 2, actionsCompleted: 2, errorMessage: null, triggeredBy: 'webhook:github' },
      { id: 3, workflowId: 'w2', workflowName: 'Disk Cleanup Routine', trigger: 'monitoring', status: 'failed', startedAt: minutesAgo(120), completedAt: minutesAgo(118), duration: 145, actions: 2, actionsCompleted: 1, errorMessage: 'Cleanup script timed out after 120s', triggeredBy: 'automation-engine' },
      { id: 4, workflowId: 'w3', workflowName: 'Tunnel Recovery', trigger: 'health_score', status: 'success', startedAt: minutesAgo(240), completedAt: minutesAgo(239), duration: 12, actions: 2, actionsCompleted: 2, errorMessage: null, triggeredBy: 'automation-engine' },
      { id: 5, workflowId: 'w1', workflowName: 'CPU Throttle Response', trigger: 'monitoring', status: 'running', startedAt: minutesAgo(2), completedAt: null, duration: 0, actions: 3, actionsCompleted: 1, errorMessage: null, triggeredBy: 'automation-engine' },
      { id: 6, workflowId: 'w8', workflowName: 'Docker Health Check', trigger: 'notification', status: 'failed', startedAt: minutesAgo(480), completedAt: minutesAgo(479), duration: 25, actions: 2, actionsCompleted: 1, errorMessage: 'Container restart failed: permission denied', triggeredBy: 'automation-engine' },
      { id: 7, workflowId: 'w4', workflowName: 'Weekly Backup', trigger: 'schedule', status: 'success', startedAt: minutesAgo(2880), completedAt: minutesAgo(2875), duration: 285, actions: 3, actionsCompleted: 3, errorMessage: null, triggeredBy: 'scheduler' },
      { id: 8, workflowId: 'w6', workflowName: 'Memory Pressure Alert', trigger: 'analytics', status: 'cancelled', startedAt: minutesAgo(1440), completedAt: minutesAgo(1440), duration: 5, actions: 2, actionsCompleted: 0, errorMessage: 'Workflow paused mid-execution', triggeredBy: 'automation-engine' },
      { id: 9, workflowId: 'w2', workflowName: 'Disk Cleanup Routine', trigger: 'monitoring', status: 'success', startedAt: minutesAgo(1800), completedAt: minutesAgo(1797), duration: 110, actions: 2, actionsCompleted: 2, errorMessage: null, triggeredBy: 'automation-engine' },
      { id: 10, workflowId: 'w5', workflowName: 'GitHub Sync', trigger: 'webhook', status: 'pending', startedAt: minutesAgo(0.5), completedAt: null, duration: 0, actions: 2, actionsCompleted: 0, errorMessage: null, triggeredBy: 'webhook:git-push' },
    ],
    queue: {
      pending: 4,
      running: 2,
      completed: 1242,
      failed: 38,
      throughput: 3.2,
      avgWaitTime: 8.5,
    },
    retry: {
      enabled: true,
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 30,
      totalRetries: 87,
      successRate: 78.5,
    },
    rollback: {
      enabled: true,
      strategies: ['snapshot', 'git-revert', 'config-restore'],
      rollbacksPerformed: 12,
      rollbackSuccessRate: 91.7,
      lastRollback: minutesAgo(1440),
    },
    scheduler: {
      type: 'cron',
      cron: '0 2 * * 0',
      timezone: 'UTC',
      nextRun: minutesAgo(-5760),
      lastRun: minutesAgo(2880),
    },
    timeline: Array.from({ length: 24 }).map((_, i) => {
      const running = Math.round(Math.random() * 3);
      const success = Math.round(5 + Math.sin(i * 0.5) * 3 + Math.random() * 2);
      const failed = Math.round(Math.random() * 2);
      return {
        timestamp: minutesAgo(24 - i),
        running,
        success,
        failed,
      };
    }),
    activity: [
      { id: 'a1', type: 'execution', message: 'CPU Throttle Response executed successfully (32ms)', timestamp: minutesAgo(14), severity: 'success', workflowName: 'CPU Throttle Response' },
      { id: 'a2', type: 'execution', message: 'GitHub Sync completed — pushed 3 commits', timestamp: minutesAgo(59), severity: 'success', workflowName: 'GitHub Sync' },
      { id: 'a3', type: 'failure', message: 'Disk Cleanup failed — script timed out', timestamp: minutesAgo(118), severity: 'error', workflowName: 'Disk Cleanup Routine' },
      { id: 'a4', type: 'execution', message: 'Tunnel Recovery restored connection', timestamp: minutesAgo(239), severity: 'success', workflowName: 'Tunnel Recovery' },
      { id: 'a5', type: 'execution', message: 'CPU Throttle Response is running (action 2/3)', timestamp: minutesAgo(2), severity: 'info', workflowName: 'CPU Throttle Response' },
      { id: 'a6', type: 'failure', message: 'Docker Health Check failed — permission denied', timestamp: minutesAgo(479), severity: 'error', workflowName: 'Docker Health Check' },
      { id: 'a7', type: 'retry', message: 'Retrying Disk Cleanup (attempt 2/3)', timestamp: minutesAgo(90), severity: 'warning', workflowName: 'Disk Cleanup Routine' },
      { id: 'a8', type: 'schedule', message: 'Weekly Backup scheduled for next Sunday 02:00 UTC', timestamp: minutesAgo(60), severity: 'info', workflowName: 'Weekly Backup' },
    ],
    filterCategories: [
      { id: 'all', label: 'All Workflows' },
      { id: 'active', label: 'Active' },
      { id: 'paused', label: 'Paused' },
      { id: 'failed', label: 'Failed' },
      { id: 'draft', label: 'Draft' },
    ],
  };
}
