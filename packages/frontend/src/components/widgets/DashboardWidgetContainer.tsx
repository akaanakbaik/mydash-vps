import { type ReactNode, useState } from 'react';
import { cn } from '../../utils/cn.js';
import { RefreshCw } from 'lucide-react';
interface DashboardWidgetContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  loadingState?: ReactNode;
  toolbar?: ReactNode;
  onRefresh?: () => void;
  action?: ReactNode;
}
function WidgetSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-[hsl(var(--color-border))]" />
      <div className="h-8 w-1/2 rounded bg-[hsl(var(--color-border))]" />
      <div className="h-4 w-full rounded bg-[hsl(var(--color-border))]" />
      <div className="h-4 w-2/3 rounded bg-[hsl(var(--color-border))]" />
    </div>
  );
}
export function DashboardWidgetContainer({
  title, subtitle, children, className,
  isLoading, isEmpty, isError, emptyState, errorState, loadingState,
  toolbar, onRefresh, action,
}: DashboardWidgetContainerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    onRefresh();
    requestAnimationFrame(() => {
      setIsRefreshing(false);
    });
  };
  const showSkeleton = isLoading && !children;
  return (
    <section
      className={cn(
        'rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]',
        className,
      )}
    >
      {}
      <div className="flex items-center justify-between border-b border-[hsl(var(--color-border))] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[hsl(var(--color-muted))] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
              aria-label="Refresh"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} aria-hidden="true" />
            </button>
          )}
          {action}
        </div>
      </div>
      {}
      <div className="p-5">
        {showSkeleton && (loadingState ?? <WidgetSkeleton />)}
        {isError && (errorState ?? (
          <div className="flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-danger))]">
            Failed to load data
          </div>
        ))}
        {isEmpty && !showSkeleton && (emptyState ?? (
          <div className="flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]">
            No data available
          </div>
        ))}
        {!showSkeleton && !isError && !isEmpty && children}
      </div>
    </section>
  );
}
export function WidgetToolbar({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-2', className)}>{children}</div>;
}
interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
}
export function TimeRangeSelector({
  value, onChange,
  options = [
    { label: '1h', value: '1h' },
    { label: '6h', value: '6h' },
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
  ],
}: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-[hsl(var(--color-bg))] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => { onChange(opt.value); }}
          className={cn(
            'rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]',
            value === opt.value
              ? 'bg-[hsl(var(--color-primary))] text-white'
              : 'text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]',
          )}
          aria-label={`Time range: ${opt.label}`}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
export interface SummaryCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}
const colorAccents: Record<string, string> = {
  primary: 'text-[hsl(var(--color-primary))]',
  success: 'text-[hsl(var(--color-success))]',
  warning: 'text-[hsl(var(--color-warning))]',
  danger: 'text-[hsl(var(--color-danger))]',
  info: 'text-[hsl(var(--color-accent))]',
};
export function SummaryCard({ label, value, subtitle, icon, trend, color = 'primary', onClick }: SummaryCardProps) {
  const accentColor = colorAccents[color] ?? 'text-[hsl(var(--color-muted))]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 text-left transition-all hover:border-[hsl(var(--color-border))]/80 hover:bg-[hsl(var(--color-border))]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] w-full',
      )}
      aria-label={`${label}: ${String(value)}`}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', color === 'primary' ? 'bg-[hsl(var(--color-primary))]/10' : color === 'success' ? 'bg-[hsl(var(--color-success))]/10' : color === 'warning' ? 'bg-[hsl(var(--color-warning))]/10' : color === 'danger' ? 'bg-[hsl(var(--color-danger))]/10' : 'bg-[hsl(var(--color-border))]')}>
        <div className={cn(accentColor)}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-bold', accentColor)}>{value}</span>
          {trend && (
            <span className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-[hsl(var(--color-success))]',
              trend === 'down' && 'text-[hsl(var(--color-danger))]',
              trend === 'stable' && 'text-[hsl(var(--color-muted))]',
            )}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trend === 'stable' && '→'}
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(var(--color-muted))] truncate">{label}</p>
        {subtitle && <p className="text-xs text-[hsl(var(--color-muted))] mt-0.5">{subtitle}</p>}
      </div>
    </button>
  );
}
