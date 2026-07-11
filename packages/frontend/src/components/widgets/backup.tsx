import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { HardDrive, CheckCircle, RefreshCw, Calendar, Database, Activity, Download, Server, Search, BarChart3 } from 'lucide-react';
import { Skeleton, SkeletonBlock } from '../shared/Skeleton.js';
import { ChartPlaceholder } from './ChartPlaceholder.js';
const badgeColors: Record<string, string> = {
  primary: 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]',
  success: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  warning: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  danger: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  info: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
};
export function BackupBadge({ label, variant = 'primary', className }: { label: string; variant?: string; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>{label}</span>;
}
const statusStyles: Record<string, { color: string; dot: string; label: string }> = {
  running: { color: 'text-[hsl(var(--color-primary))]', dot: 'bg-[hsl(var(--color-primary))]', label: 'Running' },
  completed: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Completed' },
  failed: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Failed' },
  scheduled: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Scheduled' },
};
export function BackupStatus({ status, className }: { status: string; className?: string }) {
  if (!(status in statusStyles)) return <span className={cn('text-xs text-[hsl(var(--color-muted))]', className)}>{status}</span>;
  const s = statusStyles[status];
  return <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', s.color, className)}><span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden="true" />{s.label}</span>;
}
export function BackupEmptyState({ title = 'No backup data', description = 'No backup data is available.', className }: { title?: string; description?: string; className?: string }) {
  return <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}><HardDrive className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" /><p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p><p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p></div>;
}
export function BackupCard({ title, icon, children, className }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return <section className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]', className)} aria-label={title}><div className="flex items-center gap-2 border-b border-[hsl(var(--color-border))] px-4 py-3"><span className="text-[hsl(var(--color-muted))]" aria-hidden="true">{icon}</span><h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">{title}</h3></div><div className="p-4">{children}</div></section>;
}
function formatSize(mb: number): string {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' TB';
  return String(Math.round(mb)) + ' GB';
}
function formatTimeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return String(mins) + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return String(hrs) + 'h ago';
  return String(Math.floor(hrs / 24)) + 'd ago';
}
export function BackupOverview({ summary }: { summary: { totalBackups: number; fullBackups: number; incrementalBackups: number; differentialBackups: number; totalSize: number; successRate: number }; className?: string }) {
  const items = [
    { label: 'Total Backups', value: String(summary.totalBackups), icon: HardDrive, color: 'text-[hsl(var(--color-primary))]' },
    { label: 'Full', value: String(summary.fullBackups), icon: Server, color: 'text-[hsl(var(--color-accent))]' },
    { label: 'Incremental', value: String(summary.incrementalBackups), icon: Activity, color: 'text-[hsl(var(--color-info))]' },
    { label: 'Differential', value: String(summary.differentialBackups), icon: BarChart3, color: 'text-[hsl(var(--color-warning))]' },
    { label: 'Total Size', value: formatSize(summary.totalSize), icon: Database, color: 'text-[hsl(var(--color-muted))]' },
    { label: 'Success Rate', value: summary.successRate.toFixed(1) + '%', icon: CheckCircle, color: summary.successRate >= 95 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]' },
  ];
  return <div className={cn('flex flex-wrap gap-4')}>{items.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-28"><item.icon className={cn('h-5 w-5 shrink-0', item.color)} aria-hidden="true" /><div><p className="text-xs text-[hsl(var(--color-muted))]">{item.label}</p><p className="text-sm font-semibold text-[hsl(var(--color-text))]">{item.value}</p></div></div>)}</div>;
}
export function BackupSummaryCard({ summary, isLoading }: { summary: { totalBackups: number; successRate: number; lastBackup: string; nextScheduled: string }; isLoading?: boolean }) {
  if (isLoading) return <BackupCard title="Summary" icon={<BarChart3 className="h-4 w-4" />}><SkeletonBlock lines={4} /></BackupCard>;
  return <BackupCard title="Summary" icon={<BarChart3 className="h-4 w-4" />}><div className="space-y-3"><div className="flex items-baseline gap-2"><span className="text-2xl font-bold text-[hsl(var(--color-text))]">{String(summary.totalBackups)}</span><span className="text-xs text-[hsl(var(--color-muted))]">total backups</span></div><div className="flex items-center justify-between text-xs"><span className="text-[hsl(var(--color-muted))]">Success Rate</span><span className={cn('font-medium', summary.successRate >= 95 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]')}>{summary.successRate.toFixed(1)}%</span></div><div className="flex items-center justify-between text-xs"><span className="text-[hsl(var(--color-muted))]">Last Backup</span><span className="text-[hsl(var(--color-text))]">{formatTimeAgo(summary.lastBackup)}</span></div><div className="flex items-center justify-between text-xs"><span className="text-[hsl(var(--color-muted))]">Next Scheduled</span><span className="text-[hsl(var(--color-text))]">{new Date(summary.nextScheduled).toLocaleDateString()}</span></div></div></BackupCard>;
}
export function BackupStorageCard({ storageUsed, storageTotal, isLoading }: { storageUsed: number; storageTotal: number; isLoading?: boolean }) {
  if (isLoading) return <BackupCard title="Storage" icon={<Database className="h-4 w-4" />}><SkeletonBlock lines={3} /></BackupCard>;
  const pct = storageTotal > 0 ? (storageUsed / storageTotal) * 100 : 0;
  return <BackupCard title="Storage" icon={<Database className="h-4 w-4" />}><div className="space-y-2"><div className="flex items-center justify-between"><span className="text-lg font-bold text-[hsl(var(--color-text))]">{formatSize(storageUsed)}</span><span className="text-xs text-[hsl(var(--color-muted))]">of {formatSize(storageTotal)}</span></div><div className="h-2 rounded-full bg-[hsl(var(--color-border))] overflow-hidden"><div className={cn('h-full rounded-full', pct >= 80 ? 'bg-[hsl(var(--color-danger))]' : pct >= 60 ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-primary))]')} style={{ width: pct.toFixed(1) + '%' }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={'Storage: ' + Math.round(pct).toString() + '%'} /></div><p className="text-xs text-[hsl(var(--color-muted))]">{pct.toFixed(1)}% used</p></div></BackupCard>;
}
export function BackupScheduleCard({ retention, nextScheduled, isLoading }: { retention: { daily: number; weekly: number; monthly: number; yearly: number }; nextScheduled: string; isLoading?: boolean }) {
  if (isLoading) return <BackupCard title="Schedule" icon={<Calendar className="h-4 w-4" />}><SkeletonBlock lines={4} /></BackupCard>;
  return <BackupCard title="Schedule" icon={<Calendar className="h-4 w-4" />}><div className="space-y-2 text-xs"><div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Retention</span><span className="text-[hsl(var(--color-text))]">{String(retention.daily)}d / {String(retention.weekly)}w / {String(retention.monthly)}m / {String(retention.yearly)}y</span></div><div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Next Backup</span><span className="text-[hsl(var(--color-text))]">{new Date(nextScheduled).toLocaleDateString()}</span></div><div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden"><div className="h-full rounded-full w-3/4 bg-[hsl(var(--color-primary))]" role="presentation" /></div><p className="text-[10px] text-[hsl(var(--color-muted))]">7 days until next full backup</p></div></BackupCard>;
}
export function BackupRestoreCard({ restores, isLoading }: { restores: { id: number; backupName: string; status: string; duration: number; reason: string }[]; isLoading?: boolean }) {
  if (isLoading) return <BackupCard title="Restore History" icon={<Download className="h-4 w-4" />}><SkeletonBlock lines={3} /></BackupCard>;
  return <BackupCard title="Restore History" icon={<Download className="h-4 w-4" />}><div className="space-y-2">{restores.slice(0, 3).map((r) => <div key={r.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] p-2.5"><div className="min-w-0"><p className="text-xs font-medium text-[hsl(var(--color-text))]">{r.backupName}</p><p className="text-[10px] text-[hsl(var(--color-muted))] truncate">{r.reason}</p></div><div className="flex items-center gap-2 shrink-0"><BackupStatus status={r.status} /><span className="text-[10px] text-[hsl(var(--color-muted))]">{String(r.duration)}s</span></div></div>)}</div></BackupCard>;
}
export function BackupProgressCard({ running, total, status, isLoading }: { running: number; total: number; status: string; isLoading?: boolean }) {
  if (isLoading) return <BackupCard title="Progress" icon={<RefreshCw className="h-4 w-4" />}><SkeletonBlock lines={3} /></BackupCard>;
  const pct = total > 0 ? (running / total) * 100 : 0;
  return <BackupCard title="Progress" icon={<RefreshCw className="h-4 w-4" />}><div className="space-y-2"><div className="flex items-center justify-between"><span className="text-lg font-bold text-[hsl(var(--color-text))]">{String(running)}</span><span className="text-xs text-[hsl(var(--color-muted))]">running</span></div><BackupStatus status={status} /><div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden"><div className={cn('h-full rounded-full', pct > 0 ? 'bg-[hsl(var(--color-primary))]' : 'bg-[hsl(var(--color-border))]')} style={{ width: pct.toFixed(1) + '%' }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={'Progress: ' + Math.round(pct).toString() + '%'} /></div><p className="text-xs text-[hsl(var(--color-muted))]">{String(total)} total backups</p></div></BackupCard>;
}
export function BackupTimeline({ data, label = 'Backup Timeline', isLoading, className }: { data: { timestamp: string; full: number; incremental: number; differential: number; failed: number }[]; label?: string; isLoading?: boolean; className?: string }) {
  if (isLoading) return <div className={cn('space-y-2', className)}><Skeleton className="h-32 w-full" /></div>;
  if (data.length === 0) return <div className={cn('flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>No timeline data</div>;
  return <div className={cn('space-y-3', className)}><ChartPlaceholder label={label} height="md" variant="bar" /></div>;
}
export function BackupActivity({ activity, isLoading, className }: { activity: { id: string; type: string; message: string; timestamp: string; severity: string }[]; isLoading?: boolean; className?: string }) {
  if (isLoading) return <div className={cn('space-y-2', className)}><SkeletonBlock lines={5} /></div>;
  if (activity.length === 0) return <div className={cn('flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>No activity</div>;
  return <div className={cn('space-y-1', className)}>{activity.slice(0, 8).map((a) => <div key={a.id} className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[hsl(var(--color-bg))]/50"><span className={cn('mt-0.5', a.severity === 'error' ? 'text-[hsl(var(--color-danger))]' : a.severity === 'success' ? 'text-[hsl(var(--color-success))]' : a.severity === 'warning' ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-accent))]')} aria-hidden="true"><Activity className="h-3.5 w-3.5" /></span><div className="flex-1 min-w-0"><p className="text-xs text-[hsl(var(--color-text))]">{a.message}</p><p className="text-[10px] text-[hsl(var(--color-muted))] mt-0.5">{formatTimeAgo(a.timestamp)}</p></div></div>)}</div>;
}
export function BackupSearch({ value, onChange, placeholder = 'Search backups...', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return <div className={cn('relative', className)}><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" aria-hidden="true" /><input type="text" value={value} onChange={(e) => { onChange(e.target.value); }} placeholder={placeholder} className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]" aria-label={placeholder} /></div>;
}
export function BackupFilter({ options, selected, onChange, className }: { options: { id: string; label: string }[]; selected: string; onChange: (id: string) => void; className?: string }) {
  if (options.length === 0) return null;
  return <div className={cn('flex flex-wrap gap-1.5', className)}>{options.map((opt) => <button key={opt.id} type="button" onClick={() => { onChange(opt.id); }} className={cn('rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]', selected === opt.id ? 'bg-[hsl(var(--color-primary))] text-white' : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]')} aria-pressed={selected === opt.id} aria-label={'Filter by ' + opt.label}>{opt.label}</button>)}</div>;
}
export { formatTimeAgo };
