import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock3, Database, HardDrive, Network, RefreshCw, Server, ShieldAlert, Terminal, XCircle } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import { RealtimeChart } from '../components/shared/RealtimeChart.js';
import { ErrorState, SkeletonBlock } from '../components/shared/Skeleton.js';
import { useObservability } from '../hooks/useObservability.js';
import type { ObservabilityRange, PeriodComparison } from '../repositories/observability.js';
import { cn } from '../utils/cn.js';

const ranges: { key: ObservabilityRange; label: string }[] = [
  { key: '1h', label: '1h' },
  { key: '6h', label: '6h' },
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
];
const colors = {
  primary: 'hsl(var(--color-primary))',
  accent: 'hsl(var(--color-accent))',
  warning: 'hsl(var(--color-warning))',
  danger: 'hsl(var(--color-danger))',
  success: 'hsl(var(--color-success))',
};
function formatBytes(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'Unavailable';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let current = Math.max(0, value);
  while (current >= 1024 && index < units.length - 1) { current /= 1024; index += 1; }
  return `${current.toFixed(index === 0 ? 0 : current >= 10 ? 0 : 1)} ${units[index]}`;
}
function formatPercent(value: number | null): string {
  return value === null ? 'Unavailable' : `${value.toFixed(2)}%`;
}
function formatDate(value: string | null): string {
  if (!value) return 'Unavailable';
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unavailable';
}
function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return 'Unavailable';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${days}d ${hours}h ${minutes}m`;
}
function tone(status: string): string {
  if (status === 'running' || status === 'available' || status === 'healthy' || status === 'stable') return 'text-[hsl(var(--color-success))]';
  if (status === 'failed' || status === 'critical' || status === 'degraded') return 'text-[hsl(var(--color-danger))]';
  if (status === 'warning' || status === 'baseline-unavailable') return 'text-[hsl(var(--color-warning))]';
  return 'text-[hsl(var(--color-muted))]';
}
function panelClass(): string {
  return 'rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] shadow-[0_12px_28px_rgba(0,0,0,0.16)]';
}
function Delta({ comparison }: { comparison: PeriodComparison }) {
  if (comparison.delta === null) return <span className="text-[hsl(var(--color-muted))]">Unavailable</span>;
  const positive = comparison.delta > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return <span className={cn('inline-flex items-center gap-1 font-mono', positive ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-success))')}><Icon className="h-3.5 w-3.5" />{comparison.delta.toFixed(2)}{comparison.deltaPercent === null ? '' : ` (${comparison.deltaPercent.toFixed(1)}%)`}</span>;
}
export function ObservabilityPage() {
  const [range, setRange] = useState<ObservabilityRange>('24h');
  const { data, isLoading, isFetching, isError, refetch } = useObservability(range);
  const networkSeries = useMemo(() => {
    if (!data) return [];
    const values = data.network.samples.filter((sample) => sample.timestamp && sample.totalBytesPerSec !== null).map((sample) => ({ timestamp: sample.timestamp as string, value: Math.max(0, (sample.totalBytesPerSec as number) / 1048576) }));
    return [{ label: 'Total throughput MB/s', color: colors.primary, data: values, fill: true }];
  }, [data]);
  const uptimeSeries = useMemo(() => {
    if (!data) return [];
    const values = data.availability.uptimePoints.filter((point) => point.timestamp && point.uptimeSeconds !== null).map((point) => ({ timestamp: point.timestamp as string, value: Math.max(0, (point.uptimeSeconds as number) / 86400) }));
    return [{ label: 'Uptime days', color: colors.accent, data: values, fill: true }];
  }, [data]);
  if (isLoading) return <PageContainer maxWidth="xl"><SkeletonBlock lines={4} /><div className="mt-6"><SkeletonBlock lines={18} /></div></PageContainer>;
  if (isError || !data) return <PageContainer maxWidth="xl"><ErrorState title="Observability data unavailable" action={<button type="button" onClick={() => void refetch()} className="rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-semibold text-white">Retry</button>} /></PageContainer>;
  return (
    <PageContainer maxWidth="xl">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--color-primary))]/15 text-[hsl(var(--color-primary))]"><Activity className="h-5 w-5" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--color-primary))]">Deep telemetry</p><h1 className="text-2xl font-bold text-[hsl(var(--color-text))]">Observability</h1></div>{isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" />}</div>
          <p className="max-w-2xl text-sm text-[hsl(var(--color-muted))]">Evidence-first operational view untuk event, disk, service, health, comparison, network, dan availability dari host agent serta PostgreSQL.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><div className="flex rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] p-1">{ranges.map((item) => <button key={item.key} type="button" onClick={() => setRange(item.key)} className={cn('rounded-md px-3 py-1.5 text-xs font-semibold transition-colors', range === item.key ? 'bg-[hsl(var(--color-primary))] text-white' : 'text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]')}>{item.label}</button>)}</div><button type="button" onClick={() => void refetch()} className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-2 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]" aria-label="Refresh observability"><RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} /></button></div>
      </header>
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cn(panelClass(), 'p-4')}><div className="mb-3 flex items-center justify-between"><span className="text-xs text-[hsl(var(--color-muted))]">Collector coverage</span><Database className="h-4 w-4 text-[hsl(var(--color-primary))]" /></div><p className="text-2xl font-bold text-[hsl(var(--color-text))]">{formatPercent(data.availability.coveragePercent)}</p><p className="mt-1 text-[11px] text-[hsl(var(--color-muted))]">{String(data.availability.observedBuckets)} / {String(data.availability.expectedBuckets)} minute buckets</p></div>
        <div className={cn(panelClass(), 'p-4')}><div className="mb-3 flex items-center justify-between"><span className="text-xs text-[hsl(var(--color-muted))]">Health score</span><ShieldAlert className="h-4 w-4 text-[hsl(var(--color-warning))]" /></div><p className="text-2xl font-bold text-[hsl(var(--color-warning))]">{data.healthFactors.overall === null ? 'Unavailable' : data.healthFactors.overall.toFixed(2)}</p><p className="mt-1 text-[11px] text-[hsl(var(--color-muted))]">Grade {data.healthFactors.grade} · confidence {formatPercent(data.healthFactors.confidence)}</p></div>
        <div className={cn(panelClass(), 'p-4')}><div className="mb-3 flex items-center justify-between"><span className="text-xs text-[hsl(var(--color-muted))]">Root disk</span><HardDrive className="h-4 w-4 text-[hsl(var(--color-danger))]" /></div><p className="text-2xl font-bold text-[hsl(var(--color-danger))]">{formatPercent(data.disk.usedPercent)}</p><p className="mt-1 text-[11px] text-[hsl(var(--color-muted))]">{formatBytes(data.disk.usedBytes)} / {formatBytes(data.disk.totalBytes)}</p></div>
        <div className={cn(panelClass(), 'p-4')}><div className="mb-3 flex items-center justify-between"><span className="text-xs text-[hsl(var(--color-muted))]">Network total</span><Network className="h-4 w-4 text-[hsl(var(--color-accent))]" /></div><p className="text-2xl font-bold text-[hsl(var(--color-accent))]">{data.network.totalSpeed === null ? 'Unavailable' : `${data.network.totalSpeed.toFixed(3)} MB/s`}</p><p className="mt-1 text-[11px] text-[hsl(var(--color-muted))]">{data.network.activeInterface} · {data.network.dominantDirection}</p></div>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardWidgetContainer title="Event and log timeline" subtitle={`${String(data.events.length)} observed events · audit, logs, services, health`} className="min-w-0"><div className="max-h-[470px] space-y-2 overflow-y-auto pr-1">{data.events.length === 0 ? <Empty text="Belum ada event tersimpan pada range ini." /> : data.events.slice(0, 40).map((event) => <div key={event.id} className="flex gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] p-3"><div className={cn('mt-0.5 shrink-0', tone(event.severity))}>{event.severity === 'critical' ? <XCircle className="h-4 w-4" /> : event.severity === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="truncate text-xs font-semibold text-[hsl(var(--color-text))]">{event.title}</p><time className="shrink-0 text-[10px] text-[hsl(var(--color-muted))]">{formatDate(event.timestamp)}</time></div><p className="mt-1 text-xs text-[hsl(var(--color-muted))]">{event.message}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-[hsl(var(--color-primary))]">{event.source} · {event.kind}</p></div></div>)}</div></DashboardWidgetContainer>
        <DashboardWidgetContainer title="Disk analyzer" subtitle={`${data.disk.scope} · sampled ${formatDate(data.disk.sampledAt)}`} className="min-w-0"><div className="mb-4 grid grid-cols-2 gap-3"><Metric label="Filesystem" value={data.disk.filesystem} /><Metric label="Available" value={formatBytes(data.disk.availableBytes)} /><Metric label="Read speed" value={data.disk.readSpeedBps === null ? 'Unavailable' : `${formatBytes(data.disk.readSpeedBps)}/s`} /><Metric label="Scan" value={data.disk.directoryScanStatus} /></div><div className="space-y-2">{data.disk.topDirectories.length === 0 ? <Empty text="Top directory scan unavailable dari host agent." /> : data.disk.topDirectories.map((directory) => <div key={directory.path} className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] p-2.5"><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="truncate font-mono text-[hsl(var(--color-text))]">{directory.path}</span><span className="shrink-0 font-semibold text-[hsl(var(--color-warning))]">{formatBytes(directory.bytes)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-border))]"><div className="h-full rounded-full bg-[hsl(var(--color-warning))] transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, directory.percentOfRoot ?? 0))}%` }} /></div><p className="mt-1 text-[10px] text-[hsl(var(--color-muted))]">{directory.percentOfRoot === null ? 'Root share unavailable' : `${directory.percentOfRoot.toFixed(2)}% of root filesystem`}</p></div>)}</div></DashboardWidgetContainer>
        <DashboardWidgetContainer title="Service monitor" subtitle="Read-only systemd state dari host agent" className="min-w-0"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="border-b border-[hsl(var(--color-border))] text-[10px] uppercase tracking-wide text-[hsl(var(--color-muted))]"><th className="px-2 py-2">Service</th><th className="px-2 py-2">State</th><th className="px-2 py-2">Enabled</th><th className="px-2 py-2">Samples</th><th className="px-2 py-2">Running</th><th className="px-2 py-2">Last seen</th></tr></thead><tbody>{data.services.map((service) => <tr key={service.name} className="border-b border-[hsl(var(--color-border))]/60"><td className="px-2 py-2 font-mono text-[hsl(var(--color-text))]">{service.name}</td><td className={cn('px-2 py-2 font-semibold capitalize', tone(service.status))}>{service.status}</td><td className="px-2 py-2 text-[hsl(var(--color-muted))]">{service.enabledState}</td><td className="px-2 py-2 font-mono text-[hsl(var(--color-muted))]">{String(service.sampleCount)}</td><td className="px-2 py-2 font-mono text-[hsl(var(--color-muted))]">{formatPercent(service.runningSamplePercent)}</td><td className="px-2 py-2 text-[10px] text-[hsl(var(--color-muted))]">{formatDate(service.lastSeen)}</td></tr>)}</tbody></table></div></DashboardWidgetContainer>
        <DashboardWidgetContainer title="Health score explainability" subtitle={data.healthFactors.explanation} className="min-w-0"><div className="mb-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] p-3"><div className="flex items-center justify-between"><span className="text-xs text-[hsl(var(--color-muted))]">Persisted overall score</span><span className="text-lg font-bold text-[hsl(var(--color-warning))]">{data.healthFactors.overall === null ? 'Unavailable' : data.healthFactors.overall.toFixed(2)} · {data.healthFactors.grade}</span></div><p className="mt-1 text-[10px] text-[hsl(var(--color-muted))]">Calculated {formatDate(data.healthFactors.calculatedAt)} · confidence {formatPercent(data.healthFactors.confidence)}</p></div><div className="space-y-3">{data.healthFactors.factors.map((factor) => <div key={factor.domain}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-[hsl(var(--color-text))]">{factor.label}</span><span className={tone(factor.status)}>{factor.score === null ? 'Unavailable' : `${factor.score.toFixed(2)} · ${factor.status}`}</span></div><div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--color-border))]"><div className={cn('h-full rounded-full transition-all duration-500', factor.status === 'critical' ? 'bg-[hsl(var(--color-danger))]' : factor.status === 'warning' ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-success))]')} style={{ width: `${factor.score === null ? 0 : Math.min(100, Math.max(0, factor.score))}%` }} /></div><div className="mt-1 flex flex-wrap justify-between gap-2 text-[10px] text-[hsl(var(--color-muted))]"><span>{factor.evidence}</span><span>{factor.weight > 0 ? `weight ${(factor.weight * 100).toFixed(0)}%` : 'diagnostic only'}</span></div></div>)}</div></DashboardWidgetContainer>
        <DashboardWidgetContainer title="Period comparison" subtitle={`Current ${range} vs previous ${range} window`} className="min-w-0"><div className="space-y-2">{data.comparisons.map((comparison) => <div key={comparison.metric} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] p-3"><span className="text-xs font-semibold uppercase text-[hsl(var(--color-text))]">{comparison.metric}</span><span className="font-mono text-xs text-[hsl(var(--color-muted))]">{comparison.current === null ? 'Unavailable' : comparison.current.toFixed(2)}</span><Delta comparison={comparison} /><span className="text-[10px] text-[hsl(var(--color-muted))]">confidence {String(comparison.confidence)}%</span></div>)}</div></DashboardWidgetContainer>
        <DashboardWidgetContainer title="Network detail" subtitle={`${data.network.rateAvailable ? 'Rate measured from host counters' : 'Rate unavailable until valid delta counter exists'}`} className="min-w-0"><div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="RX" value={data.network.rxSpeed === null ? 'Unavailable' : `${data.network.rxSpeed.toFixed(3)} MB/s`} /><Metric label="TX" value={data.network.txSpeed === null ? 'Unavailable' : `${data.network.txSpeed.toFixed(3)} MB/s`} /><Metric label="Average" value={data.network.averageSpeed === null ? 'Unavailable' : `${data.network.averageSpeed.toFixed(3)} MB/s`} /><Metric label="Peak" value={data.network.peakSpeed === null ? 'Unavailable' : `${data.network.peakSpeed.toFixed(3)} MB/s`} /></div><RealtimeChart series={networkSeries} height={200} yLabel="MB/s" /><div className="mt-4 space-y-2">{data.network.interfaces.length === 0 ? <Empty text="Interface counters unavailable." /> : data.network.interfaces.map((item) => <div key={item.name} className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-xs"><span className="font-mono text-[hsl(var(--color-text))]">{item.name}</span><span className="text-[hsl(var(--color-muted))]">RX {item.rxGiB.toFixed(2)} GiB · TX {item.txGiB.toFixed(2)} GiB</span></div>)}</div></DashboardWidgetContainer>
        <DashboardWidgetContainer title="Uptime and availability" subtitle={`${data.availability.host.hostname} · evidence coverage over ${range}`} className="min-w-0"><div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Host uptime" value={formatDuration(data.availability.host.uptimeSeconds)} /><Metric label="Boot time" value={formatDate(data.availability.host.bootTime)} /><Metric label="Last seen" value={formatDate(data.availability.lastSeen)} /><Metric label="Missing buckets" value={String(data.availability.missingBuckets)} /></div><RealtimeChart series={uptimeSeries} height={200} yLabel="days" /><div className="mt-4 space-y-2">{data.availability.serviceHistory.map((item) => <div key={item.name} className="flex items-center justify-between gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-xs"><span className="truncate font-mono text-[hsl(var(--color-text))]">{item.name}</span><span className={cn('shrink-0 font-semibold', tone(item.status))}>{item.status} · {formatPercent(item.coveragePercent)}</span></div>)}</div>{data.availability.gaps.length > 0 && <p className="mt-3 rounded-lg border border-[hsl(var(--color-warning))]/30 bg-[hsl(var(--color-warning))]/5 p-3 text-[11px] text-[hsl(var(--color-warning))]">{String(data.availability.gaps[0].missingBuckets)} minute bucket(s) have no observed heartbeat in this range. Missing data is shown as a gap, not healthy uptime.</p>}</DashboardWidgetContainer>
      </div>
      <footer className="mt-6 flex flex-wrap items-center gap-3 text-[10px] text-[hsl(var(--color-muted))]"><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />Generated {formatDate(data.generatedAt)}</span><span className="inline-flex items-center gap-1"><Server className="h-3 w-3" />Status {data.status}</span><span className="inline-flex items-center gap-1"><Terminal className="h-3 w-3" />Read-only telemetry</span></footer>
    </PageContainer>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] p-3"><p className="text-[10px] uppercase tracking-wide text-[hsl(var(--color-muted))]">{label}</p><p className="mt-1 truncate text-xs font-semibold text-[hsl(var(--color-text))]">{value}</p></div>;
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-[hsl(var(--color-border))] p-6 text-center text-xs text-[hsl(var(--color-muted))]">{text}</div>;
}
