import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import {
  Bell, BellRing, CheckCircle, XCircle, AlertTriangle, Clock,
  Send, Activity, Server, Shield,
  Smartphone, RefreshCw,
  Sliders, Layers, FileText, Search,
} from 'lucide-react';
import { ChartPlaceholder } from './ChartPlaceholder.js';
import { Skeleton, SkeletonBlock } from '../shared/Skeleton.js';
interface NotificationBadgeProps {
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
export function NotificationBadge({ label, variant = 'primary', className }: NotificationBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>
      {label}
    </span>
  );
}
interface NotificationStatusProps {
  status: 'connected' | 'disconnected' | 'error' | 'unknown';
  label?: string;
  className?: string;
}
const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  connected: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Connected' },
  disconnected: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Disconnected' },
  error: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Error' },
  unknown: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Unknown' },
};
export function NotificationStatus({ status, label, className }: NotificationStatusProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {label ?? config.label}
    </span>
  );
}
interface NotificationEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}
export function NotificationEmptyState({ title = 'No notifications', description = 'No notification data is available at this time.', className }: NotificationEmptyStateProps) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}>
      <Bell className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p>
    </div>
  );
}
interface NotificationCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}
export function NotificationCard({ title, icon, children, className }: NotificationCardProps) {
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
interface NotificationOverviewProps {
  summary: {
    totalSent: number;
    delivered: number;
    failed: number;
    pending: number;
    successRate: number;
  };
  className?: string;
}
export function NotificationOverview({ summary, className }: NotificationOverviewProps) {
  const items = [
    { label: 'Total Sent', value: summary.totalSent.toLocaleString(), icon: Send, color: 'text-[hsl(var(--color-primary))]' },
    { label: 'Delivered', value: summary.delivered.toLocaleString(), icon: CheckCircle, color: 'text-[hsl(var(--color-success))]' },
    { label: 'Failed', value: String(summary.failed), icon: XCircle, color: summary.failed > 0 ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-muted))]' },
    { label: 'Pending', value: String(summary.pending), icon: Clock, color: summary.pending > 0 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-muted))]' },
    { label: 'Success Rate', value: `${String(summary.successRate)}%`, icon: Activity, color: summary.successRate >= 95 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]' },
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
interface NotificationSummaryCardProps {
  summary: {
    totalSent: number;
    delivered: number;
    failed: number;
    pending: number;
    rateLimited: number;
    successRate: number;
  };
  isLoading?: boolean;
}
export function NotificationSummaryCard({ summary, isLoading }: NotificationSummaryCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Summary" icon={<BellRing className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </NotificationCard>
    );
  }
  const statItems = [
    { label: 'Delivered', value: String(summary.delivered), total: summary.totalSent, color: 'bg-[hsl(var(--color-success))]' },
    { label: 'Failed', value: String(summary.failed), total: summary.totalSent, color: 'bg-[hsl(var(--color-danger))]' },
    { label: 'Pending', value: String(summary.pending), total: summary.totalSent, color: 'bg-[hsl(var(--color-warning))]' },
    { label: 'Rate Limited', value: String(summary.rateLimited), total: summary.totalSent, color: 'bg-[hsl(var(--color-accent))]' },
  ];
  return (
    <NotificationCard title="Summary" icon={<BellRing className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(summary.totalSent)}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">total notifications</span>
        </div>
        <div className="h-2 rounded-full bg-[hsl(var(--color-border))] overflow-hidden flex">
          {statItems.map((item) => {
            const pct = item.total > 0 ? (parseInt(item.value) / item.total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={item.label}
                className={cn('h-full transition-all', item.color)}
                style={{ width: `${String(pct)}%` }}
                title={`${item.label}: ${item.value}`}
                role="presentation"
              />
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {statItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', item.color)} aria-hidden="true" />
              <span className="text-[hsl(var(--color-muted))]">{item.label}:</span>
              <span className="font-medium text-[hsl(var(--color-text))]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </NotificationCard>
  );
}
interface NotificationRuleCardProps {
  rules: { id: string; name: string; condition: string; provider: string; enabled: boolean; priority: string; lastTriggered: string | null; triggerCount: number }[];
  isLoading?: boolean;
}
const priorityColors: Record<string, string> = {
  low: 'bg-[hsl(var(--color-muted))]/10 text-[hsl(var(--color-muted))]',
  medium: 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]',
  high: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  critical: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
};
export function NotificationRuleCard({ rules, isLoading }: NotificationRuleCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Rules" icon={<Shield className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </NotificationCard>
    );
  }
  const activeRules = rules.filter((r) => r.enabled);
  return (
    <NotificationCard title={`Rules (${String(activeRules.length)} active)`} icon={<Shield className="h-4 w-4" />}>
      <div className="space-y-2">
        {rules.slice(0, 5).map((rule) => (
          <div key={rule.id} className="flex items-start justify-between gap-2 rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', rule.enabled ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
                <span className="text-xs font-medium text-[hsl(var(--color-text))]">{rule.name}</span>
                <span className={cn('rounded px-1 py-0.5 text-[10px] font-medium', priorityColors[rule.priority])}>{rule.priority}</span>
              </div>
              <p className="text-xs text-[hsl(var(--color-muted))]">{rule.condition} → {rule.provider}</p>
            </div>
            <span className="shrink-0 text-xs text-[hsl(var(--color-muted))]">{String(rule.triggerCount)}×</span>
          </div>
        ))}
      </div>
    </NotificationCard>
  );
}
interface NotificationProviderCardProps {
  providers: { name: string; type: string; enabled: boolean; status: string; latency: number; lastUsed: string }[];
  isLoading?: boolean;
}
const providerIcons: Record<string, ReactNode> = {
  dashboard: <Bell className="h-4 w-4" />,
  telegram: <Send className="h-4 w-4" />,
  whatsapp: <Smartphone className="h-4 w-4" />,
};
export function NotificationProviderCard({ providers, isLoading }: NotificationProviderCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Providers" icon={<Server className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </NotificationCard>
    );
  }
  return (
    <NotificationCard title="Providers" icon={<Server className="h-4 w-4" />}>
      <div className="space-y-2">
        {providers.map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <div className="text-[hsl(var(--color-muted))]" aria-hidden="true">{providerIcons[p.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[hsl(var(--color-text))]">{p.name}</span>
                <NotificationStatus status={p.status as 'connected' | 'disconnected' | 'error' | 'unknown'} />
              </div>
              <div className="flex items-center gap-3 text-xs text-[hsl(var(--color-muted))] mt-0.5">
                <span>Latency: {String(p.latency)}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationCard>
  );
}
interface NotificationDeliveryCardProps {
  stats: { period: string; total: number; success: number; failed: number; avgLatency: number; p95Latency: number }[];
  isLoading?: boolean;
}
export function NotificationDeliveryCard({ stats, isLoading }: NotificationDeliveryCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Delivery Stats" icon={<Activity className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </NotificationCard>
    );
  }
  return (
    <NotificationCard title="Delivery Stats" icon={<Activity className="h-4 w-4" />}>
      <div className="space-y-2">
        {stats.map((s) => {
          const successRate = s.total > 0 ? (s.success / s.total) * 100 : 0;
          return (
            <div key={s.period} className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[hsl(var(--color-text))]">{s.period}</span>
                <span className={cn('text-xs font-medium', successRate >= 95 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]')}>
                  {successRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[hsl(var(--color-muted))]">
                <span>Total: <span className="font-medium text-[hsl(var(--color-text))]">{String(s.total)}</span></span>
                <span>Success: <span className="font-medium text-[hsl(var(--color-success))]">{String(s.success)}</span></span>
                <span>Failed: <span className="font-medium text-[hsl(var(--color-danger))]">{String(s.failed)}</span></span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[hsl(var(--color-muted))] mt-1">
                <span>Avg: <span className="font-medium text-[hsl(var(--color-text))]">{String(s.avgLatency)}ms</span></span>
                <span>P95: <span className="font-medium text-[hsl(var(--color-text))]">{String(s.p95Latency)}ms</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden mt-1.5">
                <div
                  className={cn('h-full rounded-full', successRate >= 95 ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-warning))]')}
                  style={{ width: `${String(successRate)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(successRate)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.period} success rate: ${successRate.toFixed(1)}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </NotificationCard>
  );
}
interface NotificationQueueCardProps {
  queue: { pending: number; processing: number; throughput: number; avgWaitTime: number; maxQueueSize: number; backpressure: boolean };
  isLoading?: boolean;
}
export function NotificationQueueCard({ queue, isLoading }: NotificationQueueCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Queue" icon={<Clock className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </NotificationCard>
    );
  }
  const usage = queue.maxQueueSize > 0 ? (queue.pending / queue.maxQueueSize) * 100 : 0;
  return (
    <NotificationCard title="Queue" icon={<Clock className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(queue.pending)}</span>
          <span className={cn('text-xs font-medium', queue.backpressure ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-muted))]')}>
            {queue.backpressure ? '⚠ Backpressure' : 'Normal'}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--color-muted))]">Queue Usage</span>
            <span className="font-medium text-[hsl(var(--color-text))]">{usage.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', usage >= 80 ? 'bg-[hsl(var(--color-danger))]' : usage >= 50 ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-primary))]')}
              style={{ width: `${String(usage)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(usage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Queue: ${String(queue.pending)}/${String(queue.maxQueueSize)}`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Processing</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(queue.processing)}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Throughput</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(queue.throughput)}/s</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Avg Wait</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(queue.avgWaitTime)}s</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Max Queue</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(queue.maxQueueSize)}</p>
          </div>
        </div>
      </div>
    </NotificationCard>
  );
}
interface NotificationRetryCardProps {
  retry: { activeRetries: number; maxRetries: number; successRate: number; avgRetryDelay: number; nextRetryBatch: string; deadLetterCount: number };
  isLoading?: boolean;
}
export function NotificationRetryCard({ retry, isLoading }: NotificationRetryCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Retry" icon={<RefreshCw className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </NotificationCard>
    );
  }
  return (
    <NotificationCard title="Retry" icon={<RefreshCw className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(retry.activeRetries)}</span>
          <span className={cn('text-xs font-medium', retry.successRate >= 80 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]')}>
            {retry.successRate.toFixed(1)}% success
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--color-muted))]">Retry Rate</span>
            <span>{String(retry.activeRetries)}/{String(retry.maxRetries)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
            <div
              className={cn('h-full rounded-full', retry.successRate >= 80 ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-warning))]')}
              style={{ width: `${String(retry.successRate)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(retry.successRate)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Retry success: ${retry.successRate.toFixed(1)}%`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Avg Delay</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(retry.avgRetryDelay)}s</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Dead Letter</span>
            <p className="font-medium text-[hsl(var(--color-danger))]">{String(retry.deadLetterCount)}</p>
          </div>
        </div>
      </div>
    </NotificationCard>
  );
}
interface NotificationRateLimitCardProps {
  rateLimit: { currentRate: number; limit: number; remaining: number; resetAt: string; throttled: number };
  isLoading?: boolean;
}
export function NotificationRateLimitCard({ rateLimit, isLoading }: NotificationRateLimitCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Rate Limit" icon={<Sliders className="h-4 w-4" />}>
        <SkeletonBlock lines={3} />
      </NotificationCard>
    );
  }
  const usage = rateLimit.limit > 0 ? (rateLimit.currentRate / rateLimit.limit) * 100 : 0;
  return (
    <NotificationCard title="Rate Limit" icon={<Sliders className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(rateLimit.currentRate)}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">limit: {String(rateLimit.limit)}/min</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--color-muted))]">Usage</span>
            <span className={cn('font-medium', usage >= 80 ? 'text-[hsl(var(--color-danger))]' : usage >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-text))]')}>
              {usage.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
            <div
              className={cn('h-full rounded-full', usage >= 80 ? 'bg-[hsl(var(--color-danger))]' : usage >= 60 ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-primary))]')}
              style={{ width: `${String(usage)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(usage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Rate limit: ${String(rateLimit.currentRate)}/${String(rateLimit.limit)}`}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Remaining</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(rateLimit.remaining)}</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Throttled</span>
            <p className="font-medium text-[hsl(var(--color-danger))]">{String(rateLimit.throttled)}</p>
          </div>
        </div>
      </div>
    </NotificationCard>
  );
}
interface NotificationDeduplicationCardProps {
  dedup: { enabled: boolean; window: number; deduplicated: number; recentHashes: number };
  isLoading?: boolean;
}
export function NotificationDeduplicationCard({ dedup, isLoading }: NotificationDeduplicationCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Deduplication" icon={<Layers className="h-4 w-4" />}>
        <SkeletonBlock lines={3} />
      </NotificationCard>
    );
  }
  return (
    <NotificationCard title="Deduplication" icon={<Layers className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', dedup.enabled ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
            <span className="text-sm font-medium text-[hsl(var(--color-text))]">{dedup.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(dedup.deduplicated)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--color-muted))]">Window</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(dedup.window)}s</p>
          </div>
          <div>
            <span className="text-[hsl(var(--color-muted))]">Recent Hashes</span>
            <p className="font-medium text-[hsl(var(--color-text))]">{String(dedup.recentHashes)}</p>
          </div>
        </div>
      </div>
    </NotificationCard>
  );
}
interface NotificationTemplateCardProps {
  templates: { id: string; name: string; provider: string; preview: string; lastUsed: string; useCount: number }[];
  isLoading?: boolean;
}
const templateProviderIcons: Record<string, ReactNode> = {
  Dashboard: <Bell className="h-3 w-3" />,
  Telegram: <Send className="h-3 w-3" />,
  WhatsApp: <Smartphone className="h-3 w-3" />,
};
export function NotificationTemplateCard({ templates, isLoading }: NotificationTemplateCardProps) {
  if (isLoading) {
    return (
      <NotificationCard title="Templates" icon={<FileText className="h-4 w-4" />}>
        <SkeletonBlock lines={4} />
      </NotificationCard>
    );
  }
  return (
    <NotificationCard title="Templates" icon={<FileText className="h-4 w-4" />}>
      <div className="space-y-2">
        {templates.slice(0, 4).map((t) => (
          <div key={t.id} className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[hsl(var(--color-muted))]" aria-hidden="true">{templateProviderIcons[t.provider]}</span>
                <span className="text-xs font-medium text-[hsl(var(--color-text))]">{t.name}</span>
              </div>
              <span className="text-xs text-[hsl(var(--color-muted))]">{String(t.useCount)}×</span>
            </div>
            <p className="text-xs text-[hsl(var(--color-muted))] font-mono truncate">{t.preview}</p>
          </div>
        ))}
      </div>
    </NotificationCard>
  );
}
interface NotificationProviderStatusProps {
  providers: { name: string; type: string; enabled: boolean; status: string; latency: number }[];
  className?: string;
}
export function NotificationProviderStatus({ providers, className }: NotificationProviderStatusProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {providers.map((p) => (
        <NotificationStatus
          key={p.name}
          status={p.status as 'connected' | 'disconnected' | 'error' | 'unknown'}
          label={p.name}
        />
      ))}
    </div>
  );
}
interface NotificationTimelineProps {
  data: { timestamp: string; sent: number; delivered: number; failed: number }[];
  label?: string;
  isLoading?: boolean;
  className?: string;
}
export function NotificationTimeline({ data, label = 'Notification Timeline', isLoading, className }: NotificationTimelineProps) {
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
  const totalSent = data.reduce((sum, d) => sum + d.sent, 0);
  const totalFailed = data.reduce((sum, d) => sum + d.failed, 0);
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-4 text-xs text-[hsl(var(--color-muted))]">
        <span>Sent: <span className="font-medium text-[hsl(var(--color-text))]">{String(totalSent)}</span></span>
        <span>Failed: <span className="font-medium text-[hsl(var(--color-danger))]">{String(totalFailed)}</span></span>
      </div>
      <ChartPlaceholder label={label} height="md" variant="bar" />
    </div>
  );
}
interface NotificationActivityProps {
  activity: { id: string; type: string; message: string; timestamp: string; severity: string; provider: string }[];
  isLoading?: boolean;
  className?: string;
}
const activityIcons: Record<string, ReactNode> = {
  sent: <Send className="h-3.5 w-3.5" />,
  delivered: <CheckCircle className="h-3.5 w-3.5" />,
  failed: <XCircle className="h-3.5 w-3.5" />,
  rate_limited: <AlertTriangle className="h-3.5 w-3.5" />,
  deduplicated: <Layers className="h-3.5 w-3.5" />,
  retry: <RefreshCw className="h-3.5 w-3.5" />,
  provider_error: <Server className="h-3.5 w-3.5" />,
};
const severityColors: Record<string, string> = {
  info: 'text-[hsl(var(--color-accent))]',
  success: 'text-[hsl(var(--color-success))]',
  warning: 'text-[hsl(var(--color-warning))]',
  error: 'text-[hsl(var(--color-danger))]',
};
function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${String(mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${String(hrs)}h ago`;
  return `${String(Math.floor(hrs / 24))}d ago`;
}
export function NotificationActivity({ activity, isLoading, className }: NotificationActivityProps) {
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
            <p className="text-[10px] text-[hsl(var(--color-muted))] mt-0.5">{formatTimeAgo(a.timestamp)}</p>
          </div>
          <span className="text-[10px] text-[hsl(var(--color-muted))] shrink-0">{a.provider}</span>
        </div>
      ))}
    </div>
  );
}
interface NotificationFilterProps {
  options: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
  className?: string;
}
export function NotificationFilter({ options, selected, onChange, className }: NotificationFilterProps) {
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
interface NotificationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
export function NotificationSearch({ value, onChange, placeholder = 'Search notifications...', className }: NotificationSearchProps) {
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
