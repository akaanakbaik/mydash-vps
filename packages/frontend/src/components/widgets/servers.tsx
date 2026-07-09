import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import {
  Server, Monitor, HardDrive, Clock, Activity, Heart,
  Cpu, Database, MapPin, Tag,
  Power, PowerOff, AlertTriangle, Wrench, Search, ArrowUpDown,
  CheckCircle, XCircle, Terminal,
} from 'lucide-react';
import { SkeletonBlock } from '../shared/Skeleton.js';
import type { Server as ServerType } from '../../services/mockServers.js';

/* ─────────── Server Badge ─────────── */

interface ServerBadgeProps {
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

export function ServerBadge({ label, variant = 'primary', className }: ServerBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant], className)}>
      {label}
    </span>
  );
}

/* ─────────── Server Status ─────────── */

interface ServerStatusProps {
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  className?: string;
}

const statusStyles: Record<string, { color: string; dot: string; label: string; icon: ReactNode }> = {
  online: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Online', icon: <CheckCircle className="h-3 w-3" /> },
  offline: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Offline', icon: <XCircle className="h-3 w-3" /> },
  degraded: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Degraded', icon: <AlertTriangle className="h-3 w-3" /> },
  maintenance: { color: 'text-[hsl(var(--color-accent))]', dot: 'bg-[hsl(var(--color-accent))]', label: 'Maintenance', icon: <Wrench className="h-3 w-3" /> },
};

export function ServerStatus({ status, className }: ServerStatusProps) {
  const s = statusStyles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', s.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}

/* ─────────── Server Tags ─────────── */

interface ServerTagsProps {
  tags: string[];
  className?: string;
}

export function ServerTags({ tags, className }: ServerTagsProps) {
  if (tags.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded bg-[hsl(var(--color-bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--color-muted))]">
          <Tag className="h-2.5 w-2.5" aria-hidden="true" />
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ─────────── Server Empty State ─────────── */

interface ServerEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ServerEmptyState({ title = 'No servers found', description = 'No servers match the current search or filter criteria.', className }: ServerEmptyStateProps) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)}>
      <Server className="h-8 w-8 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-sm">{description}</p>
    </div>
  );
}

/* ─────────── Server Overview ─────────── */

interface ServerOverviewProps {
  totalCount: number;
  onlineCount: number;
  offlineCount: number;
  degradedCount: number;
  avgHealthScore: number;
  totalCores: number;
  className?: string;
}

export function ServerOverview({ totalCount, onlineCount, offlineCount, degradedCount, avgHealthScore, totalCores, className }: ServerOverviewProps) {
  const items = [
    { label: 'Total Servers', value: String(totalCount), icon: Server, color: 'text-[hsl(var(--color-primary))]' },
    { label: 'Online', value: String(onlineCount), icon: Power, color: 'text-[hsl(var(--color-success))]' },
    { label: 'Offline', value: String(offlineCount), icon: PowerOff, color: offlineCount > 0 ? 'text-[hsl(var(--color-danger))]' : 'text-[hsl(var(--color-muted))]' },
    { label: 'Degraded', value: String(degradedCount), icon: AlertTriangle, color: degradedCount > 0 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-muted))]' },
    { label: 'Avg Health', value: String(avgHealthScore) + '%', icon: Heart, color: avgHealthScore >= 80 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-warning))]' },
    { label: 'Total Cores', value: String(totalCores), icon: Cpu, color: 'text-[hsl(var(--color-accent))]' },
  ];

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
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

/* ─────────── Server Card ─────────── */

interface ServerCardProps {
  server: ServerType;
  onSelect?: (server: ServerType) => void;
}

function formatBytes(mb: number): string {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' TB';
  return String(Math.round(mb)) + ' GB';
}

export function ServerCard({ server, onSelect }: ServerCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(server)}
      className="w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 text-left transition-all hover:border-[hsl(var(--color-border))]/80 hover:bg-[hsl(var(--color-border))]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
      aria-label={`Select ${server.name}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Server className="h-4 w-4 shrink-0 text-[hsl(var(--color-muted))]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[hsl(var(--color-text))] truncate">{server.name}</span>
          <ServerStatus status={server.status} />
        </div>
        <span className={cn('text-xs font-bold shrink-0 ml-2', server.healthScore >= 80 ? 'text-[hsl(var(--color-success))]' : server.healthScore >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]')}>
          {server.healthScore > 0 ? String(server.healthScore) : 'N/A'}
        </span>
      </div>
      <p className="text-xs text-[hsl(var(--color-muted))] truncate mb-2">{server.hostname} · {server.ipv4} · {server.os}</p>
      <ServerTags tags={server.tags} className="mb-2" />        <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--color-muted))]">
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3" aria-hidden="true" />
            {server.cpuUsage}%
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" aria-hidden="true" />
            {server.ramUsage}%
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" aria-hidden="true" />
            {server.diskUsage}%
          </span>
        </div>
    </button>
  );
}

/* ─────────── Server Health Card ─────────── */

interface ServerHealthCardProps {
  server: ServerType;
  isLoading?: boolean;
}

export function ServerHealthCard({ server, isLoading }: ServerHealthCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
        <SkeletonBlock lines={3} />
      </div>
    );
  }

  const color = server.healthScore >= 80 ? 'bg-[hsl(var(--color-success))]' : server.healthScore >= 60 ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-danger))]';
  const textColor = server.healthScore >= 80 ? 'text-[hsl(var(--color-success))]' : server.healthScore >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]';

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">Health</h3>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center h-16 w-16 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--color-border))" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - (server.healthScore > 0 ? server.healthScore : 0) / 100)}
              className="transition-all duration-700"
            />
          </svg>
          <span className={cn('absolute text-base font-bold', textColor)}>{server.healthScore > 0 ? String(server.healthScore) : 'N/A'}</span>
        </div>
        <div className="flex-1 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--color-muted))]">Agent</span>
            <span className="text-[hsl(var(--color-text))]">v{server.agentVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--color-muted))]">Last Seen</span>
            <span className="text-[hsl(var(--color-text))]">{new Date(server.lastSeen).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Server Info Card ─────────── */

interface ServerInfoCardProps {
  server: ServerType;
  isLoading?: boolean;
}

export function ServerInfoCard({ server, isLoading }: ServerInfoCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
        <SkeletonBlock lines={5} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Monitor className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">Info</h3>
      </div>
      <div className="space-y-2 text-xs">
        {[
          { label: 'Name', value: server.name },
          { label: 'Hostname', value: server.hostname },
          { label: 'OS', value: server.os },
          { label: 'CPU', value: server.cpuModel + ' (' + String(server.cpuCores) + ' cores)' },
          { label: 'RAM', value: formatBytes(server.ramTotal) },
          { label: 'Disk', value: formatBytes(server.diskTotal) },
          { label: 'Agent', value: `v${server.agentVersion}` },
          { label: 'Created', value: new Date(server.created).toLocaleDateString() },
        ].map((item) => (
          <div key={item.label} className="flex justify-between">
            <span className="text-[hsl(var(--color-muted))]">{item.label}</span>
            <span className="text-[hsl(var(--color-text))] text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Server Resource Card ─────────── */

interface ServerResourceCardProps {
  server: ServerType;
  isLoading?: boolean;
}

export function ServerResourceCard({ server, isLoading }: ServerResourceCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
        <SkeletonBlock lines={4} />
      </div>
    );
  }

  const resources = [
    { label: 'CPU', usage: server.cpuUsage, icon: Cpu, total: String(server.cpuCores) + ' cores' },
    { label: 'RAM', usage: server.ramUsage, icon: Database, total: formatBytes(server.ramTotal) },
    { label: 'Disk', usage: server.diskUsage, icon: HardDrive, total: formatBytes(server.diskTotal) },
  ];

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">Resources</h3>
      </div>
      <div className="space-y-3">
        {resources.map((r) => {
          const barColor = r.usage >= 80 ? 'bg-[hsl(var(--color-danger))]' : r.usage >= 60 ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-success))]';
          return (
            <div key={r.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <r.icon className="h-3 w-3 text-[hsl(var(--color-muted))]" aria-hidden="true" />
                  <span className="text-[hsl(var(--color-text))]">{r.label}</span>
                </div>
                <span className={cn('font-medium', r.usage >= 80 ? 'text-[hsl(var(--color-danger))]' : r.usage >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-success))]')}>
                  {String(r.usage)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
                <div className={cn('h-full rounded-full', barColor)} style={{ width: `${String(r.usage)}%` }} role="progressbar" aria-valuenow={Math.round(r.usage)} aria-valuemin={0} aria-valuemax={100} aria-label={`${r.label}: ${String(r.usage)}%`} />
              </div>
              <p className="text-[10px] text-[hsl(var(--color-muted))]">{r.total}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Server Location Card ─────────── */

interface ServerLocationCardProps {
  server: ServerType;
  isLoading?: boolean;
}

export function ServerLocationCard({ server, isLoading }: ServerLocationCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
        <SkeletonBlock lines={3} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">Location</h3>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[hsl(var(--color-muted))]">Location</span>
          <span className="text-[hsl(var(--color-text))]">{server.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[hsl(var(--color-muted))]">Datacenter</span>
          <span className="text-[hsl(var(--color-text))]">{server.datacenter}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[hsl(var(--color-muted))]">Region</span>
          <span className="text-[hsl(var(--color-text))]">{server.region}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[hsl(var(--color-muted))]">IPv4</span>
          <span className="text-[hsl(var(--color-text))]">{server.ipv4}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[hsl(var(--color-muted))]">IPv6</span>
          <span className="text-[hsl(var(--color-text))]">{server.ipv6}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Server Uptime Card ─────────── */

interface ServerUptimeCardProps {
  server: ServerType;
  isLoading?: boolean;
}

export function ServerUptimeCard({ server, isLoading }: ServerUptimeCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
        <SkeletonBlock lines={3} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">Uptime</h3>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[hsl(var(--color-muted))]">Uptime</span>
          <span className={cn('font-medium', server.status === 'online' ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-muted))]')}>{server.uptime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[hsl(var(--color-muted))]">Last Seen</span>
          <span className="text-[hsl(var(--color-text))]">{new Date(server.lastSeen).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[hsl(var(--color-muted))]">Status</span>
          <ServerStatus status={server.status} />
        </div>
      </div>
    </div>
  );
}

/* ─────────── Server Action Menu ─────────── */

interface ServerActionMenuProps {
  server: ServerType;
  onAction?: (action: string, server: ServerType) => void;
  className?: string;
}

const serverActions = [
  { id: 'restart', label: 'Restart', icon: Power },
  { id: 'ssh', label: 'SSH Console', icon: Terminal },
  { id: 'monitor', label: 'View Monitoring', icon: Activity },
  { id: 'backup', label: 'Create Backup', icon: HardDrive },
];

export function ServerActionMenu({ server, onAction, className }: ServerActionMenuProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {serverActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction?.(action.id, server)}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[hsl(var(--color-text))] transition-colors hover:bg-[hsl(var(--color-bg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label={`${action.label} for ${server.name}`}
          >
            <Icon className="h-3.5 w-3.5 text-[hsl(var(--color-muted))]" aria-hidden="true" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────── Server Search ─────────── */

interface ServerSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ServerSearch({ value, onChange, placeholder = 'Search servers...', className }: ServerSearchProps) {
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

/* ─────────── Server Filter ─────────── */

interface ServerFilterProps {
  options: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
  className?: string;
}

export function ServerFilter({ options, selected, onChange, className }: ServerFilterProps) {
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

/* ─────────── Server Sort ─────────── */

interface ServerSortProps {
  value: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
  className?: string;
}

export function ServerSort({
  value, onChange,
  options = [
    { label: 'Name', value: 'name' },
    { label: 'Health', value: 'health' },
    { label: 'CPU', value: 'cpu' },
    { label: 'RAM', value: 'ram' },
    { label: 'Uptime', value: 'uptime' },
  ],
  className,
}: ServerSortProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <ArrowUpDown className="h-3.5 w-3.5 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <span className="text-xs text-[hsl(var(--color-muted))]">Sort:</span>
      <select
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-2 py-1 text-xs text-[hsl(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
        aria-label="Sort servers"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
