import { cn } from '../../utils/cn.js';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { Alert } from '../../services/mockDashboard.js';
const severityConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; label: string }> = {
  critical: {
    icon: AlertCircle,
    color: 'text-[hsl(var(--color-danger))]',
    bg: 'bg-[hsl(var(--color-danger))]/10',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-[hsl(var(--color-warning))]',
    bg: 'bg-[hsl(var(--color-warning))]/10',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: 'text-[hsl(var(--color-primary))]',
    bg: 'bg-[hsl(var(--color-primary))]/10',
    label: 'Info',
  },
};
interface RecentAlertsPanelProps {
  alerts: Alert[];
  className?: string;
  onDismiss?: (id: string) => void;
}
export function RecentAlertsPanel({ alerts, className, onDismiss }: RecentAlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className={cn('flex min-h-32 items-center justify-center text-sm text-[hsl(var(--color-success))]', className)}>
        All systems operational — no active alerts
      </div>
    );
  }
  return (
    <div className={cn('space-y-2', className)}>
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity] ?? severityConfig.info;
        const Icon = config.icon;
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border border-[hsl(var(--color-border))] p-3 transition-colors hover:bg-[hsl(var(--color-border))]/20',
              alert.severity === 'critical' && 'border-[hsl(var(--color-danger))]/30',
            )}
            role="alert"
          >
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', config.bg)}>
              <Icon className={cn('h-4 w-4', config.color)} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[hsl(var(--color-text))]">{alert.title}</span>
                <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider', config.bg, config.color)}>
                  {config.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[hsl(var(--color-muted))] leading-relaxed">{alert.message}</p>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[hsl(var(--color-muted))]">
                <span>{alert.category}</span>
                <span>·</span>
                <span>{alert.duration}</span>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={() => { onDismiss(alert.id); }}
                className="shrink-0 rounded p-1 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
                aria-label={`Dismiss alert: ${alert.title}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
