import { useRef, useEffect, useState, useMemo, type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
interface DataPoint {
  timestamp: string;
  value: number;
}
interface SeriesConfig {
  label: string;
  color: string;
  data: DataPoint[];
  fill?: boolean;
  dashed?: boolean;
}
interface RealtimeChartProps {
  series: SeriesConfig[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showAxis?: boolean;
  animate?: boolean;
  yLabel?: string;
  children?: ReactNode;
}
function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(1);
}
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}
export function RealtimeChart({
  series,
  height = 180,
  className,
  showGrid = true,
  showAxis = true,
  animate = true,
  yLabel,
  children,
}: RealtimeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [animVersion, setAnimVersion] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [height]);
  useEffect(() => {
    if (animate) {
      setAnimVersion((v) => v + 1);
    }
  }, [series, animate]);
  const { width, pad, chartW, chartH, yMin, yRange } = useMemo(() => {
    const pad = { top: 16, right: 16, bottom: showAxis ? 28 : 12, left: showAxis ? 48 : 12 };
    const chartW = Math.max(dimensions.width - pad.left - pad.right, 10);
    const chartH = Math.max(dimensions.height - pad.top - pad.bottom, 10);
    let yMax = -Infinity;
    let yMin = Infinity;
    for (const s of series) {
      for (const p of s.data) {
        if (p.value > yMax) yMax = p.value;
        if (p.value < yMin) yMin = p.value;
      }
    }
    if (yMax === yMin) { yMax = yMax + 10; yMin = Math.max(0, yMin - 10); }
    const padding = (yMax - yMin) * 0.15;
    yMax += padding;
    yMin = Math.max(0, yMin - padding);
    const yRange = yMax - yMin || 1;
    return { width: dimensions.width, pad, chartW, chartH, yMax, yMin, yRange };
  }, [dimensions, series, showAxis]);
  const paths = useMemo(() => {
    return series.map((s) => {
      const pts = s.data.map((p, i) => ({
        x: pad.left + (i / Math.max(s.data.length - 1, 1)) * chartW,
        y: pad.top + chartH - ((p.value - yMin) / yRange) * chartH,
      }));
      const path = smoothPath(pts);
      const areaPath = s.fill && pts.length >= 2
        ? path + ` L ${pts[pts.length - 1].x} ${pad.top + chartH} L ${pts[0].x} ${pad.top + chartH} Z`
        : '';
      return { label: s.label, color: s.color, path, areaPath, pts, dashed: s.dashed };
    });
  }, [series, pad, chartW, chartH, yMin, yRange]);
  const yTicks = useMemo(() => {
    const count = 5;
    const step = yRange / count;
    return Array.from({ length: count + 1 }, (_, i) => ({
      value: yMin + step * i,
      y: pad.top + chartH - (step * i / yRange) * chartH,
    }));
  }, [yMin, yRange, chartH, pad.top]);
  const hoveredInfo = useMemo(() => {
    if (hoveredX === null) return null;
    const results: { label: string; value: number; color: string; time: string }[] = [];
    for (const s of series) {
      let nearest: DataPoint | null = null;
      let nearestDist = Infinity;
      for (const p of s.data) {
        const px = pad.left + (s.data.indexOf(p) / Math.max(s.data.length - 1, 1)) * chartW;
        const dist = Math.abs(px - hoveredX);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = p;
        }
      }
      if (nearest) {
        results.push({ label: s.label, value: nearest.value, color: s.color, time: nearest.timestamp });
      }
    }
    return results;
  }, [hoveredX, series, pad.left, chartW]);
  if (series.length === 0 || series.every((s) => s.data.length === 0)) {
    return (
      <div ref={containerRef} className={cn('relative flex items-center justify-center', className)} style={{ height }}>
        <p className="text-xs text-[hsl(var(--color-muted))]">No data available</p>
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ height }}
      onMouseLeave={() => { setHoveredX(null); }}
    >
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        onMouseMove={(e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) setHoveredX(e.clientX - rect.left);
        }}
        role="img"
        aria-label="Real-time chart"
      >
        {}
        <defs>
          {series.map((s, i) => (
            s.fill && (
              <linearGradient key={i} id={`grad-${i}-${animVersion}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            )
          ))}
          {}
          <linearGradient id={`hover-${animVersion}-gr`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--color-text))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--color-text))" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        {}
        <rect x={pad.left} y={pad.top} width={chartW} height={chartH} fill="transparent" />
        {}
        {showGrid && yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={pad.left} y1={tick.y} x2={pad.left + chartW} y2={tick.y}
              stroke="hsl(var(--color-border))" strokeWidth={1} strokeOpacity={i === 0 ? 0.4 : 0.15}
            />
          </g>
        ))}
        {}
        {paths.map((p, i) => p.areaPath && (
          <path
            key={`area-${i}`}
            d={p.areaPath}
            fill={`url(#grad-${i}-${animVersion})`}
            className={animate ? 'transition-opacity duration-500' : ''}
          />
        ))}
        {}
        {paths.map((p, i) => (
          <path
            key={`line-${i}`}
            d={p.path}
            fill="none"
            stroke={p.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={p.dashed ? '6 3' : 'none'}
            className={animate ? 'transition-all duration-500 ease-out' : ''}
          />
        ))}
        {}
        {hoveredX !== null && hoveredInfo && (
          <>
            {}
            {paths[0]?.pts.length > 0 && (() => {
              const nearestPts = paths.map((p) => {
                let nearest = p.pts[0];
                let nearestDist = Infinity;
                for (const pt of p.pts) {
                  const dist = Math.abs(pt.x - hoveredX);
                  if (dist < nearestDist) { nearestDist = dist; nearest = pt; }
                }
                return nearest;
              });
              const avgX = nearestPts.reduce((s, pt) => s + pt.x, 0) / nearestPts.length;
              return (
                <line
                  x1={avgX} y1={pad.top} x2={avgX} y2={pad.top + chartH}
                  stroke="hsl(var(--color-text))" strokeWidth={1} strokeOpacity={0.2}
                  strokeDasharray="4 2"
                />
              );
            })()}
            {}
            {paths.map((p, i) => {
              let nearest = p.pts[0];
              let nearestDist = Infinity;
              for (const pt of p.pts) {
                const dist = Math.abs(pt.x - hoveredX);
                if (dist < nearestDist) { nearestDist = dist; nearest = pt; }
              }
              return (
                <circle key={i} cx={nearest.x} cy={nearest.y} r={4} fill={p.color} stroke="hsl(var(--color-bg))" strokeWidth={2} />
              );
            })}
          </>
        )}
        {}
        {showAxis && yTicks.map((tick, i) => (
          <text
            key={i}
            x={pad.left - 8}
            y={tick.y + 3}
            textAnchor="end"
            fill="hsl(var(--color-muted))"
            fontSize={10}
            fontFamily="var(--font-mono)"
          >
            {formatNumber(tick.value)}
          </text>
        ))}
        {}
        {showAxis && series[0]?.data.length >= 2 && (
          <>
            <text x={pad.left} y={height - 4} textAnchor="start" fill="hsl(var(--color-muted))" fontSize={10} fontFamily="var(--font-mono)">
              {formatTime(series[0].data[0].timestamp)}
            </text>
            <text x={pad.left + chartW} y={height - 4} textAnchor="end" fill="hsl(var(--color-muted))" fontSize={10} fontFamily="var(--font-mono)">
              {formatTime(series[0].data[series[0].data.length - 1].timestamp)}
            </text>
          </>
        )}
        {}
        {showAxis && yLabel && (
          <text
            x={12}
            y={pad.top + chartH / 2}
            textAnchor="middle"
            fill="hsl(var(--color-muted))"
            fontSize={10}
            transform={`rotate(-90, 12, ${pad.top + chartH / 2})`}
            fontFamily="var(--font-mono)"
          >
            {yLabel}
          </text>
        )}
      </svg>
      {}
      {hoveredX !== null && hoveredInfo && hoveredInfo.length > 0 && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-3 py-2 shadow-lg"
          style={{
            left: Math.min(
              Math.max(hoveredX - 80, 8),
              width - 170,
            ),
            top: 4,
          }}
        >
          <p className="mb-1 text-[10px] text-[hsl(var(--color-muted))]">{formatTime(hoveredInfo[0].time)}</p>
          {hoveredInfo.map((h, i) => (
            <p key={i} className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--color-text))]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} aria-hidden="true" />
              <span>{h.label}:</span>
              <span className="font-bold">{formatNumber(h.value)}</span>
            </p>
          ))}
        </div>
      )}
      {}
      {children}
    </div>
  );
}
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}
export function Sparkline({ data, color = 'hsl(var(--color-primary))', height = 32, width = 80, className }: SparklineProps) {
  if (data.length < 2) {
    return <div className={cn('flex items-center justify-center', className)} style={{ height, width }}><span className="text-[10px] text-[hsl(var(--color-muted))]">—</span></div>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (height - pad * 2) - ((v - min) / range) * (height - pad * 2),
  }));
  const path = smoothPath(pts);
  const areaPath = path + ` L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
  return (
    <svg className={cn('overflow-visible', className)} width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={`spk-${color.replace(/[^a-zA-Z0-9-]/g, '')}-gr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spk-${color.replace(/[^a-zA-Z0-9-]/g, '')}-gr)`} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
