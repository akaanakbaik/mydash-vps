import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { Skeleton } from '../shared/Skeleton.js';
import { ChartPlaceholder } from './ChartPlaceholder.js';
import {
  Cpu, MemoryStick, HardDrive, Wifi, Container, Globe, Server,
  ArrowUp, ArrowDown, Minus,
} from 'lucide-react';
interface MetricCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  status?: 'healthy' | 'warning' | 'critical' | 'inactive';
}
function statusColor(status: string): string {
  switch (status) {
    case 'healthy': return 'border-l-[hsl(var(--color-success))]';
    case 'warning': return 'border-l-[hsl(var(--color-warning))]';
    case 'critical': return 'border-l-[hsl(var(--color-danger))]';
    case 'inactive': return 'border-l-[hsl(var(--color-muted))]';
    default: return 'border-l-transparent';
  }
}
function statusIndicator(status: string): string {
  switch (status) {
    case 'healthy': return 'bg-[hsl(var(--color-success))]';
    case 'warning': return 'bg-[hsl(var(--color-warning))]';
    case 'critical': return 'bg-[hsl(var(--color-danger))]';
    case 'inactive': return 'bg-[hsl(var(--color-muted))]';
    default: return 'bg-transparent';
  }
}
export function MetricCard({ title, icon, children, className, status }: MetricCardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] border-l-2',
        status && statusColor(status),
        className,
      )}
      aria-label={`${title} metric card`}
    >
      <div className="flex items-center justify-between border-b border-[hsl(var(--color-border))] px-4 py-3">
        <div className="flex items-center gap-2">
          {status && <span className={cn('h-2 w-2 rounded-full', statusIndicator(status))} aria-label={status} />}
          <span className="text-[hsl(var(--color-muted))]" aria-hidden="true">{icon}</span>
          <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">{title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </section>
  );
}
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <ArrowUp className="h-3 w-3 text-[hsl(var(--color-danger))]" aria-hidden="true" />;
  if (trend === 'down') return <ArrowDown className="h-3 w-3 text-[hsl(var(--color-success))]" aria-hidden="true" />;
  return <Minus className="h-3 w-3 text-[hsl(var(--color-muted))]" aria-hidden="true" />;
}
function MetricRow({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' | 'stable' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[hsl(var(--color-muted))]">{label}</span>
      <span className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--color-text))]">
        {trend && <TrendIcon trend={trend} />}
        {value}
      </span>
    </div>
  );
}
function ProgressBar({ percent, color = 'primary' }: { percent: number; color?: string }) {
  const colorClass = color === 'danger'
    ? 'bg-[hsl(var(--color-danger))]'
    : color === 'warning'
      ? 'bg-[hsl(var(--color-warning))]'
      : 'bg-[hsl(var(--color-primary))]';
  return (
    <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorClass)}
        style={{ width: `${String(Math.min(percent, 100))}%` }}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${String(Math.round(percent))}%`}
      />
    </div>
  );
}
interface CpuCardProps {
  data: {
    usagePercent: number;
    cores: number;
    threads: number;
    clockCurrent: number;
    loadAverage: number;
    temperature: number | null;
    perCore: number[];
  };
  isLoading?: boolean;
}
export function CpuCard({ data, isLoading }: CpuCardProps) {
  if (isLoading) {
    return (
      <MetricCard title="CPU" icon={<Cpu className="h-4 w-4" />} status="healthy">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </MetricCard>
    );
  }
  const color = data.usagePercent > 80 ? 'danger' : data.usagePercent > 60 ? 'warning' : 'primary';
  const status = data.usagePercent > 80 ? 'critical' : data.usagePercent > 60 ? 'warning' : 'healthy';
  return (
    <MetricCard title="CPU" icon={<Cpu className="h-4 w-4" />} status={status}>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold', status === 'critical' ? 'text-[hsl(var(--color-danger))]' : status === 'warning' ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-text))]')}>
          {String(data.usagePercent)}%
        </span>
        <span className="text-xs text-[hsl(var(--color-muted))]">used</span>
      </div>
      <ProgressBar percent={data.usagePercent} color={color} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        <MetricRow label="Cores / Threads" value={`${String(data.cores)} / ${String(data.threads)}`} />
        <MetricRow label="Clock" value={`${String(data.clockCurrent)} GHz`} />
        <MetricRow label="Load Average" value={String(data.loadAverage)} />
        <MetricRow label="Temperature" value={data.temperature ? `${String(data.temperature)}°C` : 'N/A'} />
      </div>
      <ChartPlaceholder label="CPU History" height="sm" variant="line" className="mt-1" />
    </MetricCard>
  );
}
interface MemoryCardProps {
  data: {
    usagePercent: number;
    total: number;
    used: number;
    available: number;
    cached: number;
    swapUsed: number;
  };
  isLoading?: boolean;
}
function formatMb(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${String(Math.round(mb))} MB`;
}
export function MemoryCard({ data, isLoading }: MemoryCardProps) {
  if (isLoading) {
    return (
      <MetricCard title="Memory" icon={<MemoryStick className="h-4 w-4" />} status="healthy">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </MetricCard>
    );
  }
  const color = data.usagePercent > 80 ? 'danger' : data.usagePercent > 60 ? 'warning' : 'primary';
  const status = data.usagePercent > 90 ? 'critical' : data.usagePercent > 75 ? 'warning' : 'healthy';
  return (
    <MetricCard title="Memory" icon={<MemoryStick className="h-4 w-4" />} status={status}>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold', status === 'critical' ? 'text-[hsl(var(--color-danger))]' : status === 'warning' ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-text))]')}>
          {String(Math.round(data.usagePercent))}%
        </span>
        <span className="text-xs text-[hsl(var(--color-muted))]">
          {formatMb(data.used)} / {formatMb(data.total)}
        </span>
      </div>
      <ProgressBar percent={data.usagePercent} color={color} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        <MetricRow label="Available" value={formatMb(data.available)} />
        <MetricRow label="Cached" value={formatMb(data.cached)} />
        <MetricRow label="Swap Used" value={formatMb(data.swapUsed)} />
      </div>
      <ChartPlaceholder label="Memory History" height="sm" variant="area" className="mt-1" />
    </MetricCard>
  );
}
interface DiskCardProps {
  data: {
    device: string;
    mount: string;
    usagePercent: number;
    total: number;
    used: number;
    available: number;
    readSpeed: number;
    writeSpeed: number;
  };
  isLoading?: boolean;
}
export function DiskCard({ data, isLoading }: DiskCardProps) {
  if (isLoading) {
    return (
      <MetricCard title="Disk" icon={<HardDrive className="h-4 w-4" />} status="healthy">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </MetricCard>
    );
  }
  const color = data.usagePercent > 85 ? 'danger' : data.usagePercent > 70 ? 'warning' : 'primary';
  const status = data.usagePercent > 85 ? 'critical' : data.usagePercent > 70 ? 'warning' : 'healthy';
  return (
    <MetricCard title={data.device} icon={<HardDrive className="h-4 w-4" />} status={status}>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold', status === 'critical' ? 'text-[hsl(var(--color-danger))]' : status === 'warning' ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-text))]')}>
          {String(Math.round(data.usagePercent))}%
        </span>
        <span className="text-xs text-[hsl(var(--color-muted))]">
          {formatMb(data.used)} / {formatMb(data.total)}
        </span>
      </div>
      <ProgressBar percent={data.usagePercent} color={color} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        <MetricRow label="Mount" value={data.mount} />
        <MetricRow label="Available" value={formatMb(data.available)} />
        <MetricRow label="Read" value={`${String(data.readSpeed)} MB/s`} />
        <MetricRow label="Write" value={`${String(data.writeSpeed)} MB/s`} />
      </div>
    </MetricCard>
  );
}
interface NetworkCardProps {
  data: {
    interface: string;
    publicIpv4: string;
    rxSpeed: number;
    txSpeed: number;
    packetLoss: number;
    latency: number;
    connections: number;
  };
  isLoading?: boolean;
}
export function NetworkCard({ data, isLoading }: NetworkCardProps) {
  if (isLoading) {
    return (
      <MetricCard title="Network" icon={<Wifi className="h-4 w-4" />} status="healthy">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </MetricCard>
    );
  }
  const status = data.packetLoss > 1 ? 'critical' : data.latency > 50 ? 'warning' : 'healthy';
  return (
    <MetricCard title="Network" icon={<Wifi className="h-4 w-4" />} status={status}>
      <div className="flex items-baseline gap-2 pb-1">
        <span className="text-2xl font-bold text-[hsl(var(--color-text))]">
          {String(data.rxSpeed)} / {String(data.txSpeed)}
        </span>
        <span className="text-xs text-[hsl(var(--color-muted))]">MB/s</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        <MetricRow label="Interface" value={data.interface} />
        <MetricRow label="Public IP" value={data.publicIpv4} />
        <MetricRow label="Latency" value={`${String(data.latency)} ms`} trend={data.latency > 50 ? 'up' : 'stable'} />
        <MetricRow label="Packet Loss" value={`${String(data.packetLoss)}%`} trend={data.packetLoss > 1 ? 'up' : 'stable'} />
        <MetricRow label="Connections" value={String(data.connections)} />
      </div>
      <ChartPlaceholder label="Network Traffic" height="sm" variant="bar" className="mt-1" />
    </MetricCard>
  );
}
interface DockerCardProps {
  data: {
    containerCount: number;
    running: number;
    stopped: number;
    cpuPercent: number;
    memoryPercent: number;
    health: string;
  };
  isLoading?: boolean;
}
export function DockerCard({ data, isLoading }: DockerCardProps) {
  if (isLoading) {
    return (
      <MetricCard title="Docker" icon={<Container className="h-4 w-4" />} status="healthy">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </MetricCard>
    );
  }
  const status = data.health === 'healthy' ? 'healthy' : data.health === 'degraded' ? 'warning' : 'critical';
  return (
    <MetricCard title="Docker" icon={<Container className="h-4 w-4" />} status={status}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[hsl(var(--color-text))]">
          {String(data.running)} / {String(data.containerCount)}
        </span>
        <span className="text-xs text-[hsl(var(--color-muted))]">containers</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        <MetricRow label="Running" value={String(data.running)} />
        <MetricRow label="Stopped" value={String(data.stopped)} />
        <MetricRow label="CPU" value={`${String(data.cpuPercent)}%`} />
        <MetricRow label="Memory" value={`${String(data.memoryPercent)}%`} />
        <MetricRow label="Health" value={data.health} />
      </div>
    </MetricCard>
  );
}
interface TunnelCardProps {
  data: {
    provider: string;
    status: string;
    domain: string;
    ssl: boolean;
    latency: number;
    uptime: string;
  };
  isLoading?: boolean;
}
export function TunnelCard({ data, isLoading }: TunnelCardProps) {
  if (isLoading) {
    return (
      <MetricCard title="Tunnel" icon={<Globe className="h-4 w-4" />} status="healthy">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </MetricCard>
    );
  }
  const status = data.status === 'connected' ? 'healthy' : data.status === 'reconnecting' ? 'warning' : 'critical';
  return (
    <MetricCard title="Tunnel" icon={<Globe className="h-4 w-4" />} status={status}>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-[hsl(var(--color-text))] truncate">{data.domain}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          data.status === 'connected' ? 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]' :
          data.status === 'reconnecting' ? 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]' :
          'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
        )}>
          {data.status}
        </span>
        {data.ssl && <span className="text-[hsl(var(--color-success))]">SSL ✓</span>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        <MetricRow label="Provider" value={data.provider} />
        <MetricRow label="Latency" value={`${String(data.latency)} ms`} />
        <MetricRow label="Uptime" value={data.uptime} />
      </div>
    </MetricCard>
  );
}
interface ServiceCardProps {
  data: {
    name: string;
    status: string;
    cpu: number;
    memory: number;
    uptime: string;
    port: number;
  };
  isLoading?: boolean;
}
const serviceStatusColor: Record<string, string> = {
  running: 'text-[hsl(var(--color-success))] bg-[hsl(var(--color-success))]/10',
  stopped: 'text-[hsl(var(--color-muted))] bg-[hsl(var(--color-border))]',
  failed: 'text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger))]/10',
  restarting: 'text-[hsl(var(--color-warning))] bg-[hsl(var(--color-warning))]/10',
};
const serviceIndicatorColor: Record<string, string> = {
  running: 'bg-[hsl(var(--color-success))]',
  stopped: 'bg-[hsl(var(--color-muted))]',
  failed: 'bg-[hsl(var(--color-danger))]',
  restarting: 'bg-[hsl(var(--color-warning))]',
};
export function ServiceCard({ data, isLoading }: ServiceCardProps) {
  if (isLoading) {
    return (
      <MetricCard title="Service" icon={<Server className="h-4 w-4" />} status="healthy">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </MetricCard>
    );
  }
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-3 transition-all hover:border-[hsl(var(--color-border))]/80"
      aria-label={`Service: ${data.name}`}
    >
      <span className={cn('h-2 w-2 shrink-0 rounded-full', serviceIndicatorColor[data.status] ?? 'bg-[hsl(var(--color-muted))]')} aria-label={data.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--color-text))]">{data.name}</p>
        <p className="text-xs text-[hsl(var(--color-muted))]">Port {String(data.port)} · {data.uptime}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-[hsl(var(--color-text))]">{String(data.cpu)}% / {formatMb(data.memory)}</p>
        <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', serviceStatusColor[data.status] ?? 'text-[hsl(var(--color-muted))]')}>
          {data.status}
        </span>
      </div>
    </div>
  );
}
interface MetricBadgeProps {
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
export function MetricBadge({ label, variant = 'primary', className }: MetricBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[variant] ?? badgeColors.primary, className)}>
      {label}
    </span>
  );
}
interface MetricStatusProps {
  status: 'healthy' | 'warning' | 'critical' | 'inactive' | 'collecting';
  label?: string;
  className?: string;
}
const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  healthy: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Healthy' },
  warning: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Warning' },
  critical: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Critical' },
  inactive: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Inactive' },
  collecting: { color: 'text-[hsl(var(--color-primary))]', dot: 'bg-[hsl(var(--color-primary))] animate-pulse', label: 'Collecting' },
};
export function MetricStatus({ status, label, className }: MetricStatusProps) {
  const config = statusConfig[status] ?? statusConfig.inactive;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.color, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {label ?? config.label}
    </span>
  );
}
