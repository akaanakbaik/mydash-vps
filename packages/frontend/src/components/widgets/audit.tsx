import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { FileText, CheckCircle, XCircle, Users, Activity, Globe, Search } from 'lucide-react';
import { SkeletonBlock, Skeleton } from '../shared/Skeleton.js';
import { ChartPlaceholder } from './ChartPlaceholder.js';
const badgeColors: Record<string, string | undefined> = {
  success: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  failed: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  info: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
};
export function AuditBadge({ label, variant = 'info', className }: { label: string; variant?: string; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>{label}</span>;
}
const statusStyles: Record<string, { color: string; dot: string; label: string }> = {
  success: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Success' },
  failed: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Failed' },
};
export function AuditStatus({ status, className }: { status: string; className?: string }) {
  if (!(status in statusStyles)) return <span className={cn('text-xs text-[hsl(var(--color-muted))]', className)}>{status}</span>;
  const s = statusStyles[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', s.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}
export function AuditEmptyState({ title = 'No audit data', description = 'No audit data is available.', className }: { title?: string; description?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}>
      <FileText className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p>
    </div>
  );
}
export function AuditCard({ title, icon, children, className }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]', className)} aria-label={title}>
      <div className="flex items-center gap-2 border-b border-[hsl(var(--color-border))] px-4 py-3">
        <span className="text-[hsl(var(--color-muted))]" aria-hidden="true">{icon}</span>
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
function formatTimeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return String(mins) + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return String(hrs) + 'h ago';
  return String(Math.floor(hrs / 24)) + 'd ago';
}
export function AuditOverview({ summary }: { summary: { totalEvents: number; successEvents: number; failedEvents: number; uniqueUsers: number; uniqueActions: number; uniqueResources: number }; className?: string }) {
  const items = [
    { label: 'Total Events', value: String(summary.totalEvents), icon: FileText, color: 'text-[hsl(var(--color-primary))]' },
    { label: 'Success', value: String(summary.successEvents), icon: CheckCircle, color: 'text-[hsl(var(--color-success))]' },
    { label: 'Failed', value: String(summary.failedEvents), icon: XCircle, color: 'text-[hsl(var(--color-danger))]' },
    { label: 'Users', value: String(summary.uniqueUsers), icon: Users, color: 'text-[hsl(var(--color-accent))]' },
    { label: 'Actions', value: String(summary.uniqueActions), icon: Activity, color: 'text-[hsl(var(--color-warning))]' },
    { label: 'Resources', value: String(summary.uniqueResources), icon: Globe, color: 'text-[hsl(var(--color-muted))]' },
  ];
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-28">
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
export function AuditSummaryCard({ summary, isLoading }: { summary: { totalEvents: number; successEvents: number; failedEvents: number }; isLoading?: boolean }) {
  if (isLoading) return <AuditCard title="Summary" icon={<FileText className="h-4 w-4" />}><SkeletonBlock lines={4} /></AuditCard>;
  const successRate = summary.totalEvents > 0 ? ((summary.successEvents / summary.totalEvents) * 100).toFixed(1) : '0';
  return (
    <AuditCard title="Summary" icon={<FileText className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(summary.totalEvents)}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">total events</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[hsl(var(--color-muted))]">Success Rate</span>
          <span className="text-[hsl(var(--color-success))] font-medium">{successRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
          <div className="h-full rounded-full bg-[hsl(var(--color-success))]" style={{ width: successRate + '%' }} role="progressbar" aria-valuenow={Math.round(Number(successRate))} aria-valuemin={0} aria-valuemax={100} aria-label={'Success rate: ' + successRate + '%'} />
        </div>
      </div>
    </AuditCard>
  );
}
export function AuditActivityCard({ records, isLoading }: { records: { id: string; user: string; action: string; resource: string; status: string; timestamp: string }[]; isLoading?: boolean }) {
  if (isLoading) return <AuditCard title="Recent Activity" icon={<Activity className="h-4 w-4" />}><SkeletonBlock lines={4} /></AuditCard>;
  return (
    <AuditCard title="Recent Activity" icon={<Activity className="h-4 w-4" />}>
      <div className="space-y-2">
        {records.slice(0, 5).map((r) => (
          <div key={r.id} className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[hsl(var(--color-bg))]/50">
            <span className={cn('mt-0.5', r.status === 'success' ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')} aria-hidden="true">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--color-text))]">
                <span className="font-medium">{r.user}</span> {r.action}d <span className="font-medium">{r.resource}</span>
              </p>
              <p className="text-[10px] text-[hsl(var(--color-muted))] mt-0.5">{formatTimeAgo(r.timestamp)}</p>
            </div>
            <AuditStatus status={r.status} />
          </div>
        ))}
      </div>
    </AuditCard>
  );
}
export function AuditUserCard({ users, count, isLoading }: { users: string[]; count: number; isLoading?: boolean }) {
  if (isLoading) return <AuditCard title="Users" icon={<Users className="h-4 w-4" />}><SkeletonBlock lines={3} /></AuditCard>;
  return (
    <AuditCard title="Users" icon={<Users className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(count)}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">active users</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {users.map((u) => (
            <span key={u} className="rounded-full bg-[hsl(var(--color-bg))] px-2 py-0.5 text-xs text-[hsl(var(--color-muted))]">{u}</span>
          ))}
        </div>
      </div>
    </AuditCard>
  );
}
export function AuditTimeline({ data, isLoading, className }: { data: { timestamp: string; success: number; failed: number }[]; isLoading?: boolean; className?: string }) {
  if (isLoading) return <div className={cn('space-y-2', className)}><Skeleton className="h-32 w-full" /></div>;
  if (data.length === 0) return <div className={cn('flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>No timeline data</div>;
  return <div className={cn('space-y-3', className)}><ChartPlaceholder label="Audit Events" height="md" variant="bar" /></div>;
}
export function AuditSearch({ value, onChange, placeholder = 'Search audit events...', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <input type="text" value={value} onChange={(e) => { onChange(e.target.value); }} placeholder={placeholder}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
        aria-label={placeholder} />
    </div>
  );
}
export function AuditFilter({ options, selected, onChange, className }: { options: { id: string; label: string }[]; selected: string; onChange: (id: string) => void; className?: string }) {
  if (options.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt) => (
        <button key={opt.id} type="button" onClick={() => { onChange(opt.id); }}
          className={cn('rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]',
            selected === opt.id ? 'bg-[hsl(var(--color-primary))] text-white' : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]'
          )}
          aria-pressed={selected === opt.id} aria-label={'Filter by ' + opt.label}>{opt.label}</button>
      ))}
    </div>
  );
}
export { formatTimeAgo };
