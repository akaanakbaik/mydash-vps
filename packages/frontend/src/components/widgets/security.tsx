import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { Shield, AlertTriangle, Flame, Lock, Activity, Search, ShieldAlert, ShieldCheck, ThumbsUp } from 'lucide-react';
import { SkeletonBlock, Skeleton } from '../shared/Skeleton.js';
import { ChartPlaceholder } from './ChartPlaceholder.js';
const badgeColors: Record<string, string> = {
  critical: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  high: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  medium: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
  low: 'bg-[hsl(var(--color-muted))]/10 text-[hsl(var(--color-muted))]',
  resolved: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  active: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  investigating: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  success: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  failed: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  blocked: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
};
export function SecurityBadge({ label, variant = 'info', className }: { label: string; variant?: string; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>{label}</span>;
}
const statusStyles: Record<string, { color: string; dot: string; label: string }> = {
  active: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Active' },
  resolved: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Resolved' },
  investigating: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Investigating' },
  success: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Success' },
  failed: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Failed' },
  blocked: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Blocked' },
};
export function SecurityStatus({ status, className }: { status: string; className?: string }) {
  if (!(status in statusStyles)) return <span className={cn('text-xs text-[hsl(var(--color-muted))]', className)}>{status}</span>;
  const s = statusStyles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', s.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}
export function SecurityEmptyState({ title = 'No security data', description = 'No security data is available.', className }: { title?: string; description?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}>
      <Shield className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p>
    </div>
  );
}
export function SecurityCard({ title, icon, children, className }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
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
export function SecurityOverview({ summary }: { summary: { totalThreats: number; activeThreats: number; securityScore: number; riskLevel: string; failedLogins: number; bruteForceAttempts: number }; className?: string }) {
  const items = [
    { label: 'Security Score', value: String(summary.securityScore) + '/100', icon: ShieldCheck, color: summary.securityScore >= 80 ? 'text-[hsl(var(--color-success))]' : summary.securityScore >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]' },
    { label: 'Active Threats', value: String(summary.activeThreats), icon: Flame, color: 'text-[hsl(var(--color-danger))]' },
    { label: 'Total Threats', value: String(summary.totalThreats), icon: AlertTriangle, color: 'text-[hsl(var(--color-warning))]' },
    { label: 'Risk Level', value: summary.riskLevel.charAt(0).toUpperCase() + summary.riskLevel.slice(1), icon: ShieldAlert, color: summary.riskLevel === 'critical' ? 'text-[hsl(var(--color-danger))]' : summary.riskLevel === 'high' ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-accent))]' },
    { label: 'Failed Logins', value: String(summary.failedLogins), icon: Lock, color: 'text-[hsl(var(--color-muted))]' },
    { label: 'Brute Force', value: String(summary.bruteForceAttempts), icon: Activity, color: 'text-[hsl(var(--color-danger))]' },
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
export function SecuritySummaryCard({ summary, isLoading }: { summary: { totalThreats: number; activeThreats: number; resolvedThreats: number; securityScore: number }; isLoading?: boolean }) {
  if (isLoading) return <SecurityCard title="Summary" icon={<BarChart3Icon />}><SkeletonBlock lines={4} /></SecurityCard>;
  return (
    <SecurityCard title="Summary" icon={<Shield className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={cn('text-2xl font-bold', summary.securityScore >= 80 ? 'text-[hsl(var(--color-success))]' : summary.securityScore >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]')}>{String(summary.securityScore)}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">/100 security score</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[hsl(var(--color-muted))]">Total Threats</span>
          <span className="text-[hsl(var(--color-text))]">{String(summary.totalThreats)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[hsl(var(--color-muted))]">Active</span>
          <span className="text-[hsl(var(--color-danger))] font-medium">{String(summary.activeThreats)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[hsl(var(--color-muted))]">Resolved</span>
          <span className="text-[hsl(var(--color-success))] font-medium">{String(summary.resolvedThreats)}</span>
        </div>
      </div>
    </SecurityCard>
  );
}
function BarChart3Icon() {
  return <div className="h-4 w-4 rounded bg-current opacity-50" />;
}
export function SecurityScoreCard({ score, isLoading }: { score: number; isLoading?: boolean }) {
  if (isLoading) return <SecurityCard title="Security Score" icon={<ShieldCheck className="h-4 w-4" />}><SkeletonBlock lines={3} /></SecurityCard>;
  const pct = Math.min(score, 100);
  return (
    <SecurityCard title="Security Score" icon={<ShieldCheck className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex items-center justify-center">
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--color-border))" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={pct >= 80 ? 'hsl(var(--color-success))' : pct >= 60 ? 'hsl(var(--color-warning))' : 'hsl(var(--color-danger))'} strokeWidth="8" strokeDasharray={`${String(pct * 2.64)} ${String((100 - pct) * 2.64)}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-xl font-bold', pct >= 80 ? 'text-[hsl(var(--color-success))]' : pct >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]')}>{String(pct)}</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-[hsl(var(--color-muted))]">
          {pct >= 80 ? 'Good security posture' : pct >= 60 ? 'Needs improvement' : 'Critical attention required'}
        </p>
      </div>
    </SecurityCard>
  );
}
export function SecurityThreatCard({ threats, isLoading }: { threats: { id: string; type: string; severity: string; status: string; timestamp: string; details: string }[]; isLoading?: boolean }) {
  if (isLoading) return <SecurityCard title="Recent Threats" icon={<Flame className="h-4 w-4" />}><SkeletonBlock lines={4} /></SecurityCard>;
  if (threats.length === 0) return <SecurityCard title="Recent Threats" icon={<Flame className="h-4 w-4" />}><SecurityEmptyState title="No threats" description="No security threats detected" /></SecurityCard>;
  return (
    <SecurityCard title="Recent Threats" icon={<Flame className="h-4 w-4" />}>
      <div className="space-y-2">
        {threats.slice(0, 4).map((t) => (
          <div key={t.id} className="flex items-start gap-2.5 rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[hsl(var(--color-text))]">{t.type}</span>
                <SecurityBadge label={t.severity} variant={t.severity} />
              </div>
              <p className="text-[10px] text-[hsl(var(--color-muted))] mt-0.5 truncate">{t.details}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <SecurityStatus status={t.status} />
              <span className="text-[10px] text-[hsl(var(--color-muted))]">{formatTimeAgo(t.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </SecurityCard>
  );
}
export function SecurityFirewallCard({ firewall, isLoading }: { firewall: { enabled: boolean; rulesCount: number; blockedIps: number; allowedPorts: string[] }; isLoading?: boolean }) {
  if (isLoading) return <SecurityCard title="Firewall" icon={<Shield className="h-4 w-4" />}><SkeletonBlock lines={3} /></SecurityCard>;
  return (
    <SecurityCard title="Firewall" icon={<Shield className="h-4 w-4" />}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[hsl(var(--color-muted))]">Status</span>
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', firewall.enabled ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', firewall.enabled ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-danger))]')} aria-hidden="true" />
            {firewall.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[hsl(var(--color-muted))]">Rules</span>
          <span className="text-[hsl(var(--color-text))]">{String(firewall.rulesCount)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[hsl(var(--color-muted))]">Blocked IPs</span>
          <span className="text-[hsl(var(--color-text))]">{String(firewall.blockedIps)}</span>
        </div>
        <div className="text-xs">
          <span className="text-[hsl(var(--color-muted))]">Allowed Ports: </span>
          <span className="text-[hsl(var(--color-text))]">{firewall.allowedPorts.join(', ')}</span>
        </div>
      </div>
    </SecurityCard>
  );
}
export function SecurityTimeline({ data, isLoading, className }: { data: { timestamp: string; value: number; type: string }[]; isLoading?: boolean; className?: string }) {
  if (isLoading) return <div className={cn('space-y-2', className)}><Skeleton className="h-32 w-full" /></div>;
  if (data.length === 0) return <div className={cn('flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>No timeline data</div>;
  return <div className={cn('space-y-3', className)}><ChartPlaceholder label="Security Events" height="md" variant="bar" /></div>;
}
export function SecuritySearch({ value, onChange, placeholder = 'Search security events...', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <input type="text" value={value} onChange={(e) => { onChange(e.target.value); }} placeholder={placeholder}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
        aria-label={placeholder} />
    </div>
  );
}
export function SecurityFilter({ options, selected, onChange, className }: { options: { id: string; label: string }[]; selected: string; onChange: (id: string) => void; className?: string }) {
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
export function SecurityRecommendationCard({ recommendations, isLoading }: { recommendations: { id: string; title: string; description: string; priority: string; resolved: boolean }[]; isLoading?: boolean }) {
  if (isLoading) return <SecurityCard title="Recommendations" icon={<ThumbsUp className="h-4 w-4" />}><SkeletonBlock lines={4} /></SecurityCard>;
  return (
    <SecurityCard title="Recommendations" icon={<ThumbsUp className="h-4 w-4" />}>
      <div className="space-y-2">
        {recommendations.filter((r) => !r.resolved).slice(0, 4).map((r) => (
          <div key={r.id} className="flex items-start gap-2 rounded-lg border border-[hsl(var(--color-border))] p-2.5">
            <div className={cn('mt-0.5 h-2 w-2 rounded-full shrink-0', r.priority === 'critical' ? 'bg-[hsl(var(--color-danger))]' : r.priority === 'high' ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-accent))]')} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[hsl(var(--color-text))]">{r.title}</p>
              <p className="text-[10px] text-[hsl(var(--color-muted))] mt-0.5">{r.description}</p>
            </div>
            <SecurityBadge label={r.priority} variant={r.priority} />
          </div>
        ))}
      </div>
    </SecurityCard>
  );
}
export function SecurityPolicyCard({ policy, isLoading }: { policy: { minLength: number; requireUppercase: boolean; requireNumbers: boolean; requireSymbols: boolean; expiryDays: number; preventReuse: number }; isLoading?: boolean }) {
  if (isLoading) return <SecurityCard title="Password Policy" icon={<Lock className="h-4 w-4" />}><SkeletonBlock lines={5} /></SecurityCard>;
  return (
    <SecurityCard title="Password Policy" icon={<Lock className="h-4 w-4" />}>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Min Length</span><span className="text-[hsl(var(--color-text))]">{String(policy.minLength)}</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Uppercase</span><span className={policy.requireUppercase ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]'}>{policy.requireUppercase ? 'Required' : 'Not Required'}</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Numbers</span><span className={policy.requireNumbers ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]'}>{policy.requireNumbers ? 'Required' : 'Not Required'}</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Expiry</span><span className="text-[hsl(var(--color-text))]">{String(policy.expiryDays)} days</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Prevent Reuse</span><span className="text-[hsl(var(--color-text))]">Last {String(policy.preventReuse)}</span></div>
      </div>
    </SecurityCard>
  );
}
export { formatTimeAgo };
