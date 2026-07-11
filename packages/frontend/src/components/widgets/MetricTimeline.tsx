import { cn } from '../../utils/cn.js';
import { Skeleton } from '../shared/Skeleton.js';
import { ChartPlaceholder } from './ChartPlaceholder.js';
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
export function MetricTimeline({ data, isLoading, className }: MetricTimelineProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-3 w-48" />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className={cn('flex min-h-32 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>
        No timeline data available
      </div>
    );
  }
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-4 text-xs text-[hsl(var(--color-muted))]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))]" aria-hidden="true" />
          CPU
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-success))]" aria-hidden="true" />
          Memory
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-warning))]" aria-hidden="true" />
          Disk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-accent))]" aria-hidden="true" />
          Network
        </span>
      </div>
      <ChartPlaceholder label="Metrics Timeline" height="lg" variant="line" />
      {}
      <div className="overflow-x-auto">
        <table className="w-full text-xs" aria-label="Timeline data points">
          <thead>
            <tr className="border-b border-[hsl(var(--color-border))]">
              <th className="px-2 py-1.5 text-left text-[hsl(var(--color-muted))] font-medium">Time</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">CPU</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">Memory</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">Disk</th>
              <th className="px-2 py-1.5 text-right text-[hsl(var(--color-muted))] font-medium">Network</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(-5).reverse().map((point, i) => (
              <tr key={i} className="border-b border-[hsl(var(--color-border))]/50">
                <td className="px-2 py-1.5 text-[hsl(var(--color-muted))]">
                  {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(point.cpu)}%</td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(point.memory)}%</td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(point.disk)}%</td>
                <td className="px-2 py-1.5 text-right text-[hsl(var(--color-text))]">{String(point.network)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
