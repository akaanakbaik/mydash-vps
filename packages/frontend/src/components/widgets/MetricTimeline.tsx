import { RealtimeChart } from '../shared/RealtimeChart.js';
import { Skeleton } from '../shared/Skeleton.js';
import { cn } from '../../utils/cn.js';
interface TimelinePoint {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}
interface MetricTimelineProps {
  data: TimelinePoint[];
  isLoading?: boolean;
  className?: string;
}
function finite(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
function validTimestamp(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
function formatPercent(value: number): string {
  return `${Math.round(Math.min(100, Math.max(0, value)))}%`;
}
function formatThroughput(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} GB/s`;
  return `${value.toFixed(value < 10 ? 2 : 1)} MB/s`;
}
export function MetricTimeline({ data, isLoading, className }: MetricTimelineProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-3 w-48" />
      </div>
    );
  }
  const points = (data ?? []).flatMap((point) => {
    const timestamp = validTimestamp(point.timestamp);
    if (!timestamp) return [];
    return [{ timestamp, cpu: finite(point.cpu), memory: finite(point.memory), disk: finite(point.disk), network: Math.max(0, finite(point.network)) }];
  });
  if (points.length === 0) {
    return (
      <div className={cn('flex min-h-40 flex-col items-center justify-center gap-2 text-center', className)}>
        <p className="text-sm font-medium text-[hsl(var(--color-text))]">No timeline data available</p>
        <p className="max-w-sm text-xs text-[hsl(var(--color-muted))]">Live samples will appear after the monitoring collector records a snapshot.</p>
      </div>
    );
  }
  const utilizationSeries = [
    { label: 'CPU', color: 'hsl(var(--color-primary))', data: points.map((point) => ({ timestamp: point.timestamp, value: point.cpu })), fill: true },
    { label: 'Memory', color: 'hsl(var(--color-success))', data: points.map((point) => ({ timestamp: point.timestamp, value: point.memory })), fill: true },
    { label: 'Disk', color: 'hsl(var(--color-warning))', data: points.map((point) => ({ timestamp: point.timestamp, value: point.disk })), fill: false },
  ];
  const networkSeries = [{ label: 'Throughput', color: 'hsl(var(--color-accent))', data: points.map((point) => ({ timestamp: point.timestamp, value: point.network })), fill: true }];
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[hsl(var(--color-muted))]">
        {utilizationSeries.map((series) => (
          <span key={series.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: series.color }} aria-hidden="true" />
            {series.label}
          </span>
        ))}
      </div>
      <div className="skeuo-inset rounded-xl p-2 sm:p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-[hsl(var(--color-text))]">Resource utilization</p>
          <p className="text-[10px] text-[hsl(var(--color-muted))]">Percent</p>
        </div>
        <RealtimeChart series={utilizationSeries} height={220} yLabel="%" />
      </div>
      <div className="skeuo-inset rounded-xl p-2 sm:p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-[hsl(var(--color-text))]">Network throughput</p>
          <p className="text-[10px] text-[hsl(var(--color-muted))]">MB/s</p>
        </div>
        <RealtimeChart series={networkSeries} height={150} yLabel="MB/s" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--color-border))]">
        <table className="w-full min-w-[520px] text-xs" aria-label="Timeline data points">
          <thead>
            <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-raised)/0.4)]">
              <th className="px-3 py-2 text-left font-medium text-[hsl(var(--color-muted))]">Time</th>
              <th className="px-3 py-2 text-right font-medium text-[hsl(var(--color-muted))]">CPU</th>
              <th className="px-3 py-2 text-right font-medium text-[hsl(var(--color-muted))]">Memory</th>
              <th className="px-3 py-2 text-right font-medium text-[hsl(var(--color-muted))]">Disk</th>
              <th className="px-3 py-2 text-right font-medium text-[hsl(var(--color-muted))]">Network</th>
            </tr>
          </thead>
          <tbody>
            {points.slice(-8).reverse().map((point) => (
              <tr key={point.timestamp} className="border-b border-[hsl(var(--color-border))]/50 last:border-0">
                <td className="px-3 py-2 text-[hsl(var(--color-muted))]">{new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                <td className="px-3 py-2 text-right font-mono text-[hsl(var(--color-text))]">{formatPercent(point.cpu)}</td>
                <td className="px-3 py-2 text-right font-mono text-[hsl(var(--color-text))]">{formatPercent(point.memory)}</td>
                <td className="px-3 py-2 text-right font-mono text-[hsl(var(--color-text))]">{formatPercent(point.disk)}</td>
                <td className="px-3 py-2 text-right font-mono text-[hsl(var(--color-text))]">{formatThroughput(point.network)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
