import { useMemo } from 'react';
import { cn } from '../../utils/cn.js';
const COLORS = {
  primary: 'hsl(var(--color-primary))',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#eab308',
  info: '#3b82f6',
  accent: 'hsl(var(--color-accent))',
  muted: 'hsl(var(--color-muted))',
  border: 'hsl(var(--color-border))',
} as const;
interface DataPoint {
  label: string;
  value: number;
  color?: string;
}
export function Sparkline({ data, width = 80, height = 24, color = COLORS.primary }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}
export function AreaChart({ data, height = 160, className }: { data: DataPoint[]; height?: number; className?: string }) {
  const path = useMemo(() => {
    if (!data?.length) return '';
    const w = 100;
    const h = height;
    const max = Math.max(...data.map(d => d.value), 1);
    const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.value / max) * (h - 10) - 5}`);
    const top = points.join(' L ');
    return `M 0,${h - 5} L ${top} L ${w},${h - 5} Z`;
  }, [data, height]);
  if (!data?.length) return <div className={cn('flex items-center justify-center text-xs text-[hsl(var(--color-muted))]', className)} style={{ height }}>No data</div>;
  return (
    <svg viewBox={`0 0 100 ${height}`} className={cn('w-full', className)} preserveAspectRatio="none" aria-label="Area chart">
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={path} fill="url(#area-fill)" />
      {data.map((d, i) => {
        const w = 100;
        const max = Math.max(...data.map(x => x.value), 1);
        const x = (i / (data.length - 1)) * w;
        const y = height - (d.value / max) * (height - 10) - 5;
        return <circle key={i} cx={x} cy={y} r="1.5" fill={d.color ?? COLORS.primary} />;
      })}
    </svg>
  );
}
export function BarChart({ data, height = 120, className, showLabels = true }: { data: DataPoint[]; height?: number; className?: string; showLabels?: boolean }) {
  if (!data?.length) return <div className={cn('flex items-center justify-center text-xs text-[hsl(var(--color-muted))]', className)} style={{ height }}>No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className={cn('flex items-end gap-1', className)} style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
            <div
              className="w-full rounded-t transition-all duration-500 ease-out hover:opacity-80"
              style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: d.color ?? COLORS.primary, minHeight: pct > 0 ? '4px' : '0' }}
              title={`${d.label}: ${d.value}`}
            />
            {showLabels && <span className="text-[9px] text-[hsl(var(--color-muted))] truncate w-full text-center">{d.label}</span>}
          </div>
        );
      })}
    </div>
  );
}
export function DonutChart({ data, size = 120, strokeWidth = 20, className }: { data: DataPoint[]; size?: number; strokeWidth?: number; className?: string }) {
  const arcs = useMemo(() => {
    if (!data?.length) return [];
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const r = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    let currentAngle = -Math.PI / 2; 
    return data.map(d => {
      const pct = d.value / total;
      const angle = pct * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      return {
        path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        color: d.color ?? COLORS.primary,
        label: d.label,
        value: d.value,
        pct: Math.round(pct * 100),
      };
    });
  }, [data, size, strokeWidth]);
  if (!data?.length) return <div className={cn('flex items-center justify-center text-xs text-[hsl(var(--color-muted))]', className)} style={{ width: size, height: size }}>No data</div>;
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Donut chart">
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill="none" stroke={arc.color} strokeWidth={strokeWidth} strokeLinecap="butt" />
        ))}
        <circle cx={size / 2} cy={size / 2} r={size / 2 - strokeWidth} fill="hsl(var(--color-bg))" />
      </svg>
      <div className="flex flex-wrap justify-center gap-2">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--color-muted))]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: arc.color }} />
            <span>{arc.label}: {arc.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ProgressBar({ value, max = 100, label, color, height = 6, className }: { value: number; max?: number; label?: string; color?: string; height?: number; className?: string }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && <span className="text-[10px] text-[hsl(var(--color-muted))] w-12 shrink-0">{label}</span>}
      <div className="flex-1 rounded-full bg-[hsl(var(--color-border))]" style={{ height }}>
        <div
          className="rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, height, backgroundColor: color ?? (pct > 80 ? COLORS.danger : pct > 60 ? COLORS.warning : COLORS.success) }}
        />
      </div>
      <span className="text-[10px] font-mono text-[hsl(var(--color-muted))] w-10 text-right">{Math.round(pct)}%</span>
    </div>
  );
}
export function PieChart({ data, size = 140, className }: { data: DataPoint[]; size?: number; className?: string }) {
  const segments = useMemo(() => {
    if (!data?.length) return [];
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const r = size / 2 - 2;
    let currentAngle = -Math.PI / 2;
    return data.map(d => {
      const angle = (d.value / total) * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      const x1 = size / 2 + r * Math.cos(startAngle);
      const y1 = size / 2 + r * Math.sin(startAngle);
      const x2 = size / 2 + r * Math.cos(endAngle);
      const y2 = size / 2 + r * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const path = `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      return { path, color: d.color ?? COLORS.primary, label: d.label, value: d.value, pct: Math.round((d.value / total) * 100) };
    });
  }, [data, size]);
  if (!data?.length) return <div className={cn('flex items-center justify-center text-xs text-[hsl(var(--color-muted))]', className)} style={{ width: size, height: size }}>No data</div>;
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Pie chart">
        {segments.map((seg, i) => (
          <path key={i} d={seg.path} fill={seg.color} stroke="hsl(var(--color-bg))" strokeWidth="1" />
        ))}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1 text-[10px] text-[hsl(var(--color-muted))]">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span>{seg.label}: {seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4', className)}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--color-foreground))]">{title}</h3>
        {subtitle && <p className="text-xs text-[hsl(var(--color-muted))]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
