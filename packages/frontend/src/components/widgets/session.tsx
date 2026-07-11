import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { Clock, Monitor, Globe, Smartphone, Server, Terminal, Search, Shield } from 'lucide-react';
const badgeColors: Record<string, string> = {
  active: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
  expired: 'bg-[hsl(var(--color-muted))]/10 text-[hsl(var(--color-muted))]',
  revoked: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  web: 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]',
  api: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
  ssh: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  cli: 'bg-[hsl(var(--color-muted))]/10 text-[hsl(var(--color-muted))]',
};
export function SessionBadge({ label, variant = 'active', className }: { label: string; variant?: string; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>{label}</span>;
}
const statusStyles: Record<string, { color: string; dot: string; label: string }> = {
  active: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Active' },
  expired: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Expired' },
  revoked: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Revoked' },
};
export function SessionStatus({ status, className }: { status: string; className?: string }) {
  if (!(status in statusStyles)) return <span className={cn('text-xs text-[hsl(var(--color-muted))]', className)}>{status}</span>;
  const s = statusStyles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', s.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}
export function SessionEmptyState({ title = 'No sessions', description = 'No session data available.', className }: { title?: string; description?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}>
      <Clock className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p>
    </div>
  );
}
export function SessionCard({ title, icon, children, className }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
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
export function SessionOverview({ summary }: { summary: { totalSessions: number; activeSessions: number; webSessions: number; apiSessions: number; sshSessions: number; cliSessions: number; trustedDevices: number }; className?: string }) {
  const items = [
    { label: 'Total Sessions', value: String(summary.totalSessions), icon: Clock, color: 'text-[hsl(var(--color-primary))]' },
    { label: 'Active', value: String(summary.activeSessions), icon: Shield, color: 'text-[hsl(var(--color-success))]' },
    { label: 'Web', value: String(summary.webSessions), icon: Globe, color: 'text-[hsl(var(--color-accent))]' },
    { label: 'API', value: String(summary.apiSessions), icon: Terminal, color: 'text-[hsl(var(--color-warning))]' },
    { label: 'SSH', value: String(summary.sshSessions), icon: Server, color: 'text-[hsl(var(--color-danger))]' },
    { label: 'Trusted', value: String(summary.trustedDevices), icon: Shield, color: 'text-[hsl(var(--color-success))]' },
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
export function CurrentSessionCard({ session }: { session: { name: string; type: string; device: string; browser: string; os: string; ip: string; location: string; created: string; lastActive: string; isTrusted: boolean } }) {
  return (
    <SessionCard title="Current Session" icon={<Monitor className="h-4 w-4" />}>
      <div className="space-y-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]/10">
            <Monitor className="h-5 w-5 text-[hsl(var(--color-primary))]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--color-text))]">{session.name}</p>
            <p className="text-xs text-[hsl(var(--color-muted))]">{session.device}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-[hsl(var(--color-muted))]">Browser</span><p className="text-[hsl(var(--color-text))]">{session.browser}</p></div>
          <div><span className="text-[hsl(var(--color-muted))]">OS</span><p className="text-[hsl(var(--color-text))]">{session.os}</p></div>
          <div><span className="text-[hsl(var(--color-muted))]">IP</span><p className="text-[hsl(var(--color-text))]">{session.ip}</p></div>
          <div><span className="text-[hsl(var(--color-muted))]">Location</span><p className="text-[hsl(var(--color-text))]">{session.location}</p></div>
          <div><span className="text-[hsl(var(--color-muted))]">Created</span><p className="text-[hsl(var(--color-text))]">{formatTimeAgo(session.created)}</p></div>
          <div><span className="text-[hsl(var(--color-muted))]">Last Active</span><p className="text-[hsl(var(--color-text))]">{formatTimeAgo(session.lastActive)}</p></div>
        </div>
        {session.isTrusted && <p className="text-xs text-[hsl(var(--color-success))] flex items-center gap-1"><Shield className="h-3 w-3" />Trusted device</p>}
      </div>
    </SessionCard>
  );
}
export function DeviceCard({ device }: { device: { name: string; type: string; os: string; browser: string; lastActive: string; isCurrent: boolean } }) {
  const TypeIcon = device.type === 'mobile' ? Smartphone : device.type === 'server' ? Server : Monitor;
  return (
    <div className={cn('rounded-lg border border-[hsl(var(--color-border))] p-3', device.isCurrent && 'ring-1 ring-[hsl(var(--color-primary))]')}>
      <div className="flex items-center gap-2 mb-2">
        <TypeIcon className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <p className="text-xs font-medium text-[hsl(var(--color-text))]">{device.name}</p>
        {device.isCurrent && <span className="rounded bg-[hsl(var(--color-primary))]/10 px-1 text-[10px] text-[hsl(var(--color-primary))]">Current</span>}
      </div>
      <p className="text-[10px] text-[hsl(var(--color-muted))]">{device.os} &middot; {device.browser}</p>
      <p className="text-[10px] text-[hsl(var(--color-muted))]">Last active: {formatTimeAgo(device.lastActive)}</p>
    </div>
  );
}
export function TrustedDeviceCard({ device }: { device: { name: string; type: string; os: string; lastActive: string } }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] p-3">
      <Shield className="h-4 w-4 text-[hsl(var(--color-success))]" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-xs font-medium text-[hsl(var(--color-text))]">{device.name}</p>
        <p className="text-[10px] text-[hsl(var(--color-muted))]">{device.os}</p>
      </div>
    </div>
  );
}
export function SessionSearch({ value, onChange, placeholder = 'Search sessions...', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <input type="text" value={value} onChange={(e) => { onChange(e.target.value); }} placeholder={placeholder}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
        aria-label={placeholder} />
    </div>
  );
}
export function SessionFilter({ options, selected, onChange, className }: { options: { id: string; label: string }[]; selected: string; onChange: (id: string) => void; className?: string }) {
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
