import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import {
  BarChart3, TrendingUp, AlertTriangle, Sigma, Percent, LineChart,
  Zap, Activity, Info,
} from 'lucide-react';
import { ChartPlaceholder } from './ChartPlaceholder.js';
import { Skeleton } from '../shared/Skeleton.js';
import { SkeletonBlock } from '../shared/Skeleton.js';
interface AnalyticsBadgeProps {
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
export function AnalyticsBadge({ label, variant = 'primary', className }: AnalyticsBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>
      {label}
    </span>
  );
}
interface AnalyticsStatusProps {
  status: 'healthy' | 'warning' | 'critical' | 'inactive';
  label?: string;
  className?: string;
}
const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  healthy: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Healthy' },
  warning: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Warning' },
  critical: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Critical' },
  inactive: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Inactive' },
};
export function AnalyticsStatus({ status, label, className }: AnalyticsStatusProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {label ?? config.label}
    </span>
  );
}
interface AnalyticsSummaryProps {
  data: {
    totalMetrics: number;
    metricsCollected: number;
    metricsFailed: number;
    storageUsed: number;
    storageTotal: number;
  };
  isLoading?: boolean;
  className?: string;
}
function formatStorage(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${String(Math.round(mb))} MB`;
}
export function AnalyticsSummary({ data, isLoading, className }: AnalyticsSummaryProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-wrap gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} lines={2} className="flex-1 min-w-32" />
        ))}
      </div>
    );
  }
  const items = [
    { label: 'Total Metrics', value: data.totalMetrics.toLocaleString(), icon: BarChart3 },
    { label: 'Collected', value: data.metricsCollected.toLocaleString(), icon: Activity, color: 'text-[hsl(var(--color-success))]' },
    { label: 'Failed', value: String(data.metricsFailed), icon: AlertTriangle, color: data.metricsFailed > 0 ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-muted))]' },
    { label: 'Storage', value: `${formatStorage(data.storageUsed)} / ${formatStorage(data.storageTotal)}`, icon: Activity },
  ];
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-40">
          <item.icon className={cn('h-5 w-5 shrink-0', item.color ?? 'text-[hsl(var(--color-primary))]')} aria-hidden="true" />
          <div>
            <p className="text-xs text-[hsl(var(--color-muted))]">{item.label}</p>
            <p className="text-sm font-semibold text-[hsl(var(--color-text))]">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
interface AnalyticsCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}
export function AnalyticsCard({ title, icon, children, className }: AnalyticsCardProps) {
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
interface AggregationCardProps {
  data: { label: string; count: number; avg: number; min: number; max: number }[];
  isLoading?: boolean;
}
export function AggregationCard({ data, isLoading }: AggregationCardProps) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Aggregations" icon={<BarChart3 className="h-4 w-4" />}>
        <SkeletonBlock lines={6} />
      </AnalyticsCard>
    );
  }
  return (
    <AnalyticsCard title="Aggregations" icon={<BarChart3 className="h-4 w-4" />}>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-1">
            <span className="text-xs text-[hsl(var(--color-muted))]">{item.label}</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[hsl(var(--color-text))] font-medium">{String(item.avg)}</span>
              <span className="text-[hsl(var(--color-muted))]">Min {String(item.min)}</span>
              <span className="text-[hsl(var(--color-muted))]">Max {String(item.max)}</span>
            </div>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}
interface TrendCardProps {
  data: { timestamp: string; value: number; movingAvg: number }[];
  isLoading?: boolean;
}
export function TrendCard({ data, isLoading }: TrendCardProps) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Trend" icon={<TrendingUp className="h-4 w-4" />}>
        <Skeleton className="h-32 w-full" />
      </AnalyticsCard>
    );
  }
  const latestVal = data.length > 0 ? data[data.length - 1].value : null;
  const oldestVal = data.length > 0 ? data[0].value : null;
  const change = (latestVal ?? 0) - (oldestVal ?? 0);
  return (
    <AnalyticsCard title="Trend" icon={<TrendingUp className="h-4 w-4" />}>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{latestVal !== null ? String(latestVal) : '—'}</span>
        <span className={cn('text-xs font-medium', change > 0 ? 'text-[hsl(var(--color-danger))]' : change < 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-muted))]')}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}
        </span>
      </div>
      <ChartPlaceholder label="Trend History" height="sm" variant="line" />
    </AnalyticsCard>
  );
}
interface AnomalyCardProps {
  data: { id: string; metric: string; value: number; expected: number; deviation: number; severity: string; timestamp: string; description: string }[];
  isLoading?: boolean;
}
const severityColors: Record<string, string> = {
  low: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  medium: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  high: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  critical: 'bg-[hsl(var(--color-danger))]/20 text-[hsl(var(--color-danger))]',
};
const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
export function AnomalyCard({ data, isLoading }: AnomalyCardProps) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Anomalies" icon={<AlertTriangle className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </AnalyticsCard>
    );
  }
  const sorted = [...data].sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
  return (
    <AnalyticsCard title="Anomalies" icon={<AlertTriangle className="h-4 w-4" />}>
      <div className="space-y-2">
        {sorted.slice(0, 5).map((a) => (
          <div key={a.id} className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[hsl(var(--color-text))]">{a.metric}</span>
              <span className={cn('rounded px-1.5 py-0.5 text-xs', severityColors[a.severity] ?? '')}>
                {a.severity}
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--color-muted))]">{a.description}</p>
            <div className="flex gap-3 mt-1 text-xs text-[hsl(var(--color-muted))]">
              <span>Value: {String(a.value)}</span>
              <span>Expected: {String(a.expected)}</span>
            </div>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}
interface StatisticsCardProps {
  data: { label: string; value: number; unit: string; description: string }[];
  isLoading?: boolean;
}
export function StatisticsCard({ data, isLoading }: StatisticsCardProps) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Statistics" icon={<Sigma className="h-4 w-4" />}>
        <SkeletonBlock lines={6} />
      </AnalyticsCard>
    );
  }
  return (
    <AnalyticsCard title="Statistics" icon={<Sigma className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-2">
        {data.map((s) => (
          <div key={s.label} className="rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <p className="text-lg font-bold text-[hsl(var(--color-text))]">{String(s.value)}{s.unit}</p>
            <p className="text-xs text-[hsl(var(--color-muted))]">{s.label}</p>
            <p className="text-xs text-[hsl(var(--color-muted))] mt-0.5">{s.description}</p>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}
interface PercentileCardProps {
  data: { label: string; p50: number; p75: number; p90: number; p95: number; p99: number }[];
  isLoading?: boolean;
}
export function PercentileCard({ data, isLoading }: PercentileCardProps) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Percentiles" icon={<Percent className="h-4 w-4" />}>
        <SkeletonBlock lines={6} />
      </AnalyticsCard>
    );
  }
  return (
    <AnalyticsCard title="Percentiles" icon={<Percent className="h-4 w-4" />}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" aria-label="Percentile distribution">
          <thead>
            <tr className="border-b border-[hsl(var(--color-border))]">
              <th className="px-2 py-1.5 text-left text-[hsl(var(--color-muted))] font-medium">Metric</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">P50</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">P75</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">P90</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">P95</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">P99</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.label} className="border-b border-[hsl(var(--color-border))]/50">
                <td className="px-2 py-1.5 text-[hsl(var(--color-text))]">{p.label}</td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(p.p50)}</td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(p.p75)}</td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(p.p90)}</td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(p.p95)}</td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(p.p99)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalyticsCard>
  );
}
interface PredictionCardProps {
  data: { timestamp: string; predicted: number; lower: number; upper: number; confidence: number }[];
  isLoading?: boolean;
}
export function PredictionCard({ data, isLoading }: PredictionCardProps) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Prediction" icon={<LineChart className="h-4 w-4" />}>
        <Skeleton className="h-32 w-full" />
      </AnalyticsCard>
    );
  }
  const lastEntry = data.length > 0 ? data[data.length - 1] : null;
  const firstEntry = data.length > 0 ? data[0] : null;
  return (
    <AnalyticsCard title="Prediction" icon={<LineChart className="h-4 w-4" />}>
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div>
          <span className="text-[hsl(var(--color-muted))]">Predicted: </span>
          <span className="font-medium text-[hsl(var(--color-text))]">{lastEntry !== null ? String(lastEntry.predicted) : '—'}</span>
        </div>
        <div>
          <span className="text-[hsl(var(--color-muted))]">Range: </span>
          <span className="font-medium text-[hsl(var(--color-text))]">
            {firstEntry !== null ? `${String(firstEntry.lower)}–${String(firstEntry.upper)}` : '—'}
          </span>
        </div>
        <div>
          <span className="text-[hsl(var(--color-muted))]">Confidence: </span>
          <span className="font-medium text-[hsl(var(--color-text))]">{lastEntry !== null ? `${lastEntry.confidence.toFixed(0)}%` : '—'}</span>
        </div>
      </div>
      <ChartPlaceholder label="48h Prediction" height="sm" variant="area" />
    </AnalyticsCard>
  );
}
interface ResourceEfficiencyCardProps {
  data: { resource: string; score: number; trend: string; recommendation: string }[];
  isLoading?: boolean;
}
export function ResourceEfficiencyCard({ data, isLoading }: ResourceEfficiencyCardProps) {
  if (isLoading) {
    return (
      <AnalyticsCard title="Resource Efficiency" icon={<Zap className="h-4 w-4" />}>
        <SkeletonBlock lines={5} />
      </AnalyticsCard>
    );
  }
  return (
    <AnalyticsCard title="Resource Efficiency" icon={<Zap className="h-4 w-4" />}>
      <div className="space-y-2">
        {data.map((r) => {
          const color = r.score >= 80 ? 'bg-[hsl(var(--color-success))]' : r.score >= 60 ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-danger))]';
          return (
            <div key={r.resource} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[hsl(var(--color-text))]">{r.resource}</span>
                <span className={cn('text-xs font-medium', r.score >= 80 ? 'text-[hsl(var(--color-success))]' : r.score >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]')}>
                  {String(r.score)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${String(r.score)}%` }} role="progressbar" aria-valuenow={r.score} aria-valuemin={0} aria-valuemax={100} aria-label={`${r.resource}: ${String(r.score)}%`} />
              </div>
              <p className="text-xs text-[hsl(var(--color-muted))]">{r.recommendation}</p>
            </div>
          );
        })}
      </div>
    </AnalyticsCard>
  );
}
interface AnalyticsTimelineProps {
  data: { timestamp: string; value: number; movingAvg: number }[];
  label?: string;
  isLoading?: boolean;
  className?: string;
}
export function AnalyticsTimeline({ data, label = 'Timeline', isLoading, className }: AnalyticsTimelineProps) {
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
  return (
    <div className={cn('space-y-3', className)}>
      <ChartPlaceholder label={label} height="md" variant="line" />
      <div className="flex items-center gap-4 text-xs text-[hsl(var(--color-muted))]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))]" aria-hidden="true" />
          Value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-muted))]" aria-hidden="true" />
          Moving Average
        </span>
      </div>
    </div>
  );
}
interface AnalyticsEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}
export function AnalyticsEmptyState({ title = 'No analytics data', description = 'No data matches the current filter criteria. Try adjusting your selection.', className }: AnalyticsEmptyStateProps) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}>
      <Info className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p>
    </div>
  );
}
interface TimeWindowSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
  className?: string;
}
export function TimeWindowSelector({
  value, onChange,
  options = [
    { label: '1h', value: '1h' },
    { label: '6h', value: '6h' },
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
  ],
  className,
}: TimeWindowSelectorProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-lg bg-[hsl(var(--color-bg))] p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => { onChange(opt.value); }}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]',
            value === opt.value
              ? 'bg-[hsl(var(--color-primary))] text-white'
              : 'text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]',
          )}
          aria-label={`Time window: ${opt.label}`}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
interface AnalyticsFilterProps {
  options: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
  className?: string;
}
export function AnalyticsFilter({ options, selected, onChange, className }: AnalyticsFilterProps) {
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
interface AnalyticsSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
export function AnalyticsSearch({ value, onChange, placeholder = 'Search analytics...', className }: AnalyticsSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
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
