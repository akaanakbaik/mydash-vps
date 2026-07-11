import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import {
  Activity, Play, CheckCircle, XCircle, Clock,
  Zap, Server, Globe, Terminal, Bell, HardDrive, GitBranch, Timer,
  RefreshCw, Shield, Calendar, Layers, Search, BarChart3,
  Cpu, TrendingUp, Heart,
  Users, Webhook,
  Container,
} from 'lucide-react';
import { ChartPlaceholder } from './ChartPlaceholder.js';
import { Skeleton, SkeletonBlock } from '../shared/Skeleton.js';
interface AutomationBadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}
const badgeColors: Record<string, string> = {
  primary: 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]',
  success: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  warning: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  danger: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  info: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
};
export function AutomationBadge({ label, variant = 'primary', className }: AutomationBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>
      {label}
    </span>
  );
}
interface AutomationStatusProps {
  status: 'active' | 'paused' | 'failed' | 'completed' | 'draft' | 'running' | 'success' | 'pending' | 'cancelled' | 'skipped';
  className?: string;
}
const statusStyles: Record<string, { color: string; dot: string; label: string }> = {
  active: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Active' },
  paused: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Paused' },
  failed: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Failed' },
  completed: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Completed' },
  draft: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Draft' },
  running: { color: 'text-[hsl(var(--color-primary))]', dot: 'bg-[hsl(var(--color-primary))]', label: 'Running' },
  success: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Success' },
  pending: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Pending' },
  cancelled: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Cancelled' },
  skipped: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Skipped' },
};
export function AutomationStatus({ status, className }: AutomationStatusProps) {
  const s = statusStyles[status] ?? statusStyles.draft;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', s.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}
interface AutomationEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}
export function AutomationEmptyState({ title = 'No automation data', description = 'No automation data is available at this time.', className }: AutomationEmptyStateProps) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}>
      <Zap className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p>
    </div>
  );
}
interface AutomationCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}
export function AutomationCard({ title, icon, children, className }: AutomationCardProps) {
  return (
    <section className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]', className)} aria-label={title}>
      <div className="flex items-center gap-2 border-b border-[hsl(var(--color-border))] px-4 py-3">
        <span className="text-[hsl(var(--color-muted))]" aria-hidden="true">{icon}</span>
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </section>
  );
}
interface AutomationOverviewProps {
  summary: {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    avgDuration: number;
  };
  className?: string;
}
export function AutomationOverview({ summary, className }: AutomationOverviewProps) {
  const items = [
    { label: 'Total Workflows', value: String(summary.totalWorkflows), icon: Zap, color: 'text-[hsl(var(--color-primary))]' },
    { label: 'Active', value: String(summary.activeWorkflows), icon: Play, color: 'text-[hsl(var(--color-success))]' },
    { label: 'Executions', value: summary.totalExecutions.toLocaleString(), icon: Activity, color: 'text-[hsl(var(--color-accent))]' },
    { label: 'Success Rate', value: `${String(summary.successRate)}%`, icon: CheckCircle, color: summary.successRate >= 90 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]' },
    { label: 'Avg Duration', value: `${String(summary.avgDuration)}s`, icon: Clock, color: 'text-[hsl(var(--color-muted))]' },
  ];
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-32">
          <item.icon className={cn('h-5 w-5 shrink-0', item.color)} aria-hidden="true" />
          <div>
            <p className="text-xs text-[hsl(var(--color-muted))]">{item.label}</p>
            <p className="text-sm font-semibold text-[hsl(var(--color-text))]">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
interface AutomationSummaryCardProps {
  summary: {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    failedToday: number;
    avgDuration: number;
  };
  isLoading?: boolean;
}
export function AutomationSummaryCard({ summary, isLoading }: AutomationSummaryCardProps) {
  if (isLoading) {
    return (
      <AutomationCard title="Summary" icon={<BarChart3 className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </AutomationCard>
    );
  }
  return (
    <AutomationCard title="Summary" icon={<BarChart3 className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <p className="text-xs text-[hsl(var(--color-muted))]">Active</p>
            <p className="text-lg font-bold text-[hsl(var(--color-success))]">{String(summary.activeWorkflows)}/{String(summary.totalWorkflows)}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <p className="text-xs text-[hsl(var(--color-muted))]">Failed Today</p>
            <p className={cn('text-lg font-bold', summary.failedToday > 0 ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-success))]')}>{String(summary.failedToday)}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <p className="text-xs text-[hsl(var(--color-muted))]">Success Rate</p>
            <p className={cn('text-lg font-bold', summary.successRate >= 90 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]')}>{summary.successRate.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <p className="text-xs text-[hsl(var(--color-muted))]">Avg Duration</p>
            <p className="text-lg font-bold text-[hsl(var(--color-text))]">{String(summary.avgDuration)}s</p>
          </div>
        </div>
      </div>
    </AutomationCard>
  );
}
interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    status: string;
    triggerLabel: string;
    actionLabels: string[];
    lastRun: string | null;
    runCount: number;
    successRate: number;
    avgDuration: number;
  };
}
function formatTimeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${String(mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${String(hrs)}h ago`;
  return `${String(Math.floor(hrs / 24))}d ago`;
}
function formatTimeAgoShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${String(mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${String(hrs)}h ago`;
  return `${String(Math.floor(hrs / 24))}d ago`;
}
export function WorkflowCard({ workflow }: WorkflowCardProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 transition-all hover:border-[hsl(var(--color-border))]/80 hover:bg-[hsl(var(--color-border))]/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[hsl(var(--color-text))] truncate">{workflow.name}</span>
            <AutomationStatus status={workflow.status as 'active' | 'paused' | 'failed' | 'completed' | 'draft' | 'running' | 'success' | 'pending' | 'cancelled' | 'skipped'} />
          </div>
          <p className="text-xs text-[hsl(var(--color-muted))] mt-0.5 truncate">{workflow.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-[hsl(var(--color-muted))] mb-2 flex-wrap">
        <span className="rounded bg-[hsl(var(--color-bg))] px-1.5 py-0.5">{workflow.triggerLabel}</span>
        <span>·</span>
        <span>{String(workflow.runCount)} runs</span>
        <span>·</span>
        <span>{String(workflow.avgDuration)}s avg</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {workflow.actionLabels.map((label, i) => (
          <span key={i} className="rounded bg-[hsl(var(--color-bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--color-muted))]">
            {label}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-[hsl(var(--color-muted))]">
        <span>Last: {formatTimeAgo(workflow.lastRun)}</span>
        <span className={cn('font-medium', workflow.successRate >= 90 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]')}>
          {workflow.successRate.toFixed(1)}% success
        </span>
      </div>
    </div>
  );
}
interface WorkflowStatusCardProps {
  workflows: { id: string; name: string; status: string; triggerLabel: string; runCount: number; successRate: number }[];
  isLoading?: boolean;
}
export function WorkflowStatusCard({ workflows, isLoading }: WorkflowStatusCardProps) {
  if (isLoading) {
    return (
      <AutomationCard title="Workflow Status" icon={<Activity className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </AutomationCard>
    );
  }
  return (
    <AutomationCard title="Workflow Status" icon={<Activity className="h-4 w-4" />}>
      <div className="space-y-1">
        {workflows.slice(0, 6).map((w) => (
          <div key={w.id} className="flex items-center justify-between rounded-lg p-1.5 transition-colors hover:bg-[hsl(var(--color-bg))]/50">
            <div className="flex items-center gap-2 min-w-0">
              <AutomationStatus status={w.status as 'active' | 'paused' | 'failed' | 'completed' | 'draft' | 'running' | 'success' | 'pending' | 'cancelled' | 'skipped'} />
              <span className="text-xs text-[hsl(var(--color-text))] truncate">{w.name}</span>
            </div>
            <span className={cn('text-xs font-medium shrink-0 ml-2', w.successRate >= 90 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]')}>
              {w.successRate.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </AutomationCard>
  );
}
interface WorkflowExecutionCardProps {
  execution: {
    id: number;
    workflowName: string;
    trigger: string;
    status: string;
    startedAt: string;
    duration: number;
    actions: number;
    actionsCompleted: number;
    errorMessage: string | null;
  };
}
export function WorkflowExecutionCard({ execution }: WorkflowExecutionCardProps) {
  return (
    <div className="rounded-lg border border-[hsl(var(--color-border))] p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-[hsl(var(--color-text))]">{execution.workflowName}</span>
        <AutomationStatus status={execution.status as 'active' | 'paused' | 'failed' | 'completed' | 'draft' | 'running' | 'success' | 'pending' | 'cancelled' | 'skipped'} />
      </div>
      <div className="flex items-center gap-3 text-xs text-[hsl(var(--color-muted))]">
        <span>Trigger: {execution.trigger}</span>
        <span>Actions: {String(execution.actionsCompleted)}/{String(execution.actions)}</span>
        <span>Duration: {String(execution.duration)}s</span>
      </div>
      {execution.errorMessage && (
        <p className="text-xs text-[hsl(var(--color-danger))] mt-1">{execution.errorMessage}</p>
      )}
    </div>
  );
}
interface TriggerCardProps {
  triggers: { type: string; label: string; description: string; enabled: boolean; config: string }[];
  isLoading?: boolean;
}
const triggerIcons: Record<string, ReactNode> = {
  monitoring: <Cpu className="h-4 w-4" />,
  analytics: <TrendingUp className="h-4 w-4" />,
  health_score: <Heart className="h-4 w-4" />,
  notification: <Bell className="h-4 w-4" />,
  manual: <Users className="h-4 w-4" />,
  schedule: <Calendar className="h-4 w-4" />,
  webhook: <Webhook className="h-4 w-4" />,
};
export function TriggerCard({ triggers, isLoading }: TriggerCardProps) {
  if (isLoading) {
    return (
      <AutomationCard title="Triggers" icon={<Shield className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </AutomationCard>
    );
  }
  return (
    <AutomationCard title="Triggers" icon={<Shield className="h-4 w-4" />}>
      <div className="space-y-2">
        {triggers.map((t) => (
          <div key={t.type} className="flex items-center gap-2.5 rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <div className="text-[hsl(var(--color-muted))]" aria-hidden="true">{triggerIcons[t.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[hsl(var(--color-text))]">{t.label}</span>
                <span className={cn('h-1.5 w-1.5 rounded-full', t.enabled ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
              </div>
              <p className="text-[10px] text-[hsl(var(--color-muted))] mt-0.5">{t.config}</p>
            </div>
          </div>
        ))}
      </div>
    </AutomationCard>
  );
}
interface ConditionCardProps {
  description?: string;
  className?: string;
}
export function ConditionCard({ description = 'When all conditions are met, the workflow executes the defined actions.', className }: ConditionCardProps) {
  return (
    <div className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Layers className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">Conditions</h3>
      </div>
      <p className="text-xs text-[hsl(var(--color-muted))]">{description}</p>
      <div className="mt-2 space-y-1">
        {['CPU > 90% for 5 minutes', 'Trigger cooldown expired', 'Maintenance mode disabled'].map((cond, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-[hsl(var(--color-muted))]">
            <CheckCircle className="h-3 w-3 text-[hsl(var(--color-success))]" aria-hidden="true" />
            {cond}
          </div>
        ))}
      </div>
    </div>
  );
}
interface ActionCardProps {
  actions: { type: string; label: string; description: string }[];
  isLoading?: boolean;
}
const actionIcons: Record<string, ReactNode> = {
  restart_service: <Server className="h-4 w-4" />,
  restart_docker: <Container className="h-4 w-4" />,
  restart_tunnel: <Globe className="h-4 w-4" />,
  run_script: <Terminal className="h-4 w-4" />,
  webhook: <Webhook className="h-4 w-4" />,
  send_notification: <Bell className="h-4 w-4" />,
  backup: <HardDrive className="h-4 w-4" />,
  github_sync: <GitBranch className="h-4 w-4" />,
  delay: <Clock className="h-4 w-4" />,
  wait: <Timer className="h-4 w-4" />,
  custom: <Zap className="h-4 w-4" />,
};
export function ActionCard({ actions, isLoading }: ActionCardProps) {
  if (isLoading) {
    return (
      <AutomationCard title="Available Actions" icon={<Zap className="h-4 w-4" />}>
        <SkeletonBlock lines={6} />
      </AutomationCard>
    );
  }
  return (
    <AutomationCard title="Available Actions" icon={<Zap className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-1.5">
        {actions.map((a) => (
          <div key={a.type} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] p-2 transition-colors hover:bg-[hsl(var(--color-bg))]/50">
            <div className="text-[hsl(var(--color-muted))]" aria-hidden="true">{actionIcons[a.type]}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[hsl(var(--color-text))]">{a.label}</p>
              <p className="text-[10px] text-[hsl(var(--color-muted))] truncate">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </AutomationCard>
  );
}
interface ExecutionQueueCardProps {
  queue: { pending: number; running: number; completed: number; failed: number; throughput: number; avgWaitTime: number };
  isLoading?: boolean;
}
export function ExecutionQueueCard({ queue, isLoading }: ExecutionQueueCardProps) {
  if (isLoading) {
    return (
      <AutomationCard title="Queue" icon={<Clock className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </AutomationCard>
    );
  }
  return (
    <AutomationCard title="Queue" icon={<Clock className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(queue.pending)}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">{String(queue.running)} running</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Completed</span>
            <p className="font-medium text-[hsl(var(--color-success))]">{queue.completed.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Failed</span>
            <p className="font-medium text-[hsl(var(--color-danger))]">{String(queue.failed)}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Throughput</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(queue.throughput)}/s</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Avg Wait</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(queue.avgWaitTime)}s</p>
          </div>
        </div>
      </div>
    </AutomationCard>
  );
}
interface RetryPolicyCardProps {
  retry: { enabled: boolean; maxRetries: number; backoffMultiplier: number; initialDelay: number; totalRetries: number; successRate: number };
  isLoading?: boolean;
}
export function RetryPolicyCard({ retry, isLoading }: RetryPolicyCardProps) {
  if (isLoading) {
    return (
      <AutomationCard title="Retry Policy" icon={<RefreshCw className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </AutomationCard>
    );
  }
  return (
    <AutomationCard title="Retry Policy" icon={<RefreshCw className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', retry.enabled ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
            <span className="text-sm font-medium text-[hsl(var(--color-text))]">{retry.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <span className={cn('text-xs font-medium', retry.successRate >= 80 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]')}>
            {retry.successRate.toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Max Retries</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(retry.maxRetries)}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Total Retries</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(retry.totalRetries)}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Backoff</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(retry.backoffMultiplier)}×</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Initial Delay</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(retry.initialDelay)}s</p>
          </div>
        </div>
      </div>
    </AutomationCard>
  );
}
interface RollbackCardProps {
  rollback: { enabled: boolean; strategies: string[]; rollbacksPerformed: number; rollbackSuccessRate: number; lastRollback: string | null };
  isLoading?: boolean;
}
export function RollbackCard({ rollback, isLoading }: RollbackCardProps) {
  if (isLoading) {
    return (
      <AutomationCard title="Rollback" icon={<RefreshCw className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </AutomationCard>
    );
  }
  return (
    <AutomationCard title="Rollback" icon={<RefreshCw className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', rollback.enabled ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
            <span className="text-sm font-medium text-[hsl(var(--color-text))]">{rollback.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <span className={cn('text-xs font-medium', rollback.rollbackSuccessRate >= 90 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]')}>
            {rollback.rollbackSuccessRate.toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Performed</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(rollback.rollbacksPerformed)}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Strategies</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{rollback.strategies.join(', ')}</p>
          </div>
        </div>
      </div>
    </AutomationCard>
  );
}
interface SchedulerCardProps {
  scheduler: { type: string; cron: string; timezone: string; nextRun: string; lastRun: string };
  isLoading?: boolean;
}
export function SchedulerCard({ scheduler, isLoading }: SchedulerCardProps) {
  if (isLoading) {
    return (
      <AutomationCard title="Scheduler" icon={<Calendar className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </AutomationCard>
    );
  }
  return (
    <AutomationCard title="Scheduler" icon={<Calendar className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-[hsl(var(--color-bg))] px-1.5 py-0.5 font-mono text-[hsl(var(--color-text))]">{scheduler.cron}</span>
          <span className="text-[hsl(var(--color-muted))]">{scheduler.timezone}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Next Run</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{new Date(scheduler.nextRun).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Last Run</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{new Date(scheduler.lastRun).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </AutomationCard>
  );
}
interface ExecutionTimelineProps {
  data: { timestamp: string; running: number; success: number; failed: number }[];
  label?: string;
  isLoading?: boolean;
  className?: string;
}
export function ExecutionTimeline({ data, label = 'Execution Timeline', isLoading, className }: ExecutionTimelineProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className={cn('flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>
        No timeline data available
      </div>
    );
  }
  const totalSuccess = data.reduce((sum, d) => sum + d.success, 0);
  const totalFailed = data.reduce((sum, d) => sum + d.failed, 0);
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-4 text-xs text-[hsl(var(--color-muted))]">
        <span>Success: <span className="font-medium text-[hsl(var(--color-success))]">{String(totalSuccess)}</span></span>
        <span>Failed: <span className="font-medium text-[hsl(var(--color-danger))]">{String(totalFailed)}</span></span>
      </div>
      <ChartPlaceholder label={label} height="md" variant="bar" />
    </div>
  );
}
interface AutomationActivityProps {
  activity: { id: string; type: string; message: string; timestamp: string; severity: string; workflowName: string }[];
  isLoading?: boolean;
  className?: string;
}
const activityIcons: Record<string, ReactNode> = {
  execution: <Play className="h-3.5 w-3.5" />,
  failure: <XCircle className="h-3.5 w-3.5" />,
  retry: <RefreshCw className="h-3.5 w-3.5" />,
  schedule: <Calendar className="h-3.5 w-3.5" />,
};
const severityColors: Record<string, string> = {
  info: 'text-[hsl(var(--color-accent))]',
  success: 'text-[hsl(var(--color-success))]',
  warning: 'text-[hsl(var(--color-warning))]',
  error: 'text-[hsl(var(--color-danger))]',
};
export function AutomationActivity({ activity, isLoading, className }: AutomationActivityProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <SkeletonBlock lines={5} />
      </div>
    );
  }
  if (activity.length === 0) {
    return (
      <div className={cn('flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>
        No recent activity
      </div>
    );
  }
  return (
    <div className={cn('space-y-1', className)}>
      {activity.slice(0, 8).map((a) => (
        <div key={a.id} className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[hsl(var(--color-bg))]/50">
          <span className={cn('mt-0.5', severityColors[a.severity])} aria-hidden="true">
            {activityIcons[a.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[hsl(var(--color-text))]">{a.message}</p>
            <p className="text-[10px] text-[hsl(var(--color-muted))] mt-0.5">{a.workflowName} · {formatTimeAgoShort(a.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
interface AutomationFilterProps {
  options: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
  className?: string;
}
export function AutomationFilter({ options, selected, onChange, className }: AutomationFilterProps) {
  if (options.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => { onChange(opt.id); }}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]',
            selected === opt.id
              ? 'bg-[hsl(var(--color-primary))] text-white'
              : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]',
          )}
          aria-pressed={selected === opt.id}
          aria-label={`Filter by ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
interface AutomationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
export function AutomationSearch({ value, onChange, placeholder = 'Search workflows...', className }: AutomationSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
        aria-label={placeholder}
      />
    </div>
  );
}
