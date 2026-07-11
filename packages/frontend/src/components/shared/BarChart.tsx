import { useRef, useEffect, useState } from 'react';
import { cn } from '../../utils/cn.js';
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  animate?: boolean;
}
export function BarChart({
  data,
  height = 180,
  className,
  showLabels = true,
  showValues = false,
  animate = true,
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });
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
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.max(4, (dimensions.width - 40) / Math.max(data.length, 1) - 8);
  return (
    <div ref={containerRef} className={cn('relative', className)} style={{ height }}>
      <svg width={dimensions.width} height={height} className="overflow-visible" role="img" aria-label="Bar chart">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="hsl(var(--color-primary))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--color-primary))" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        {}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = 12 + ((100 - pct) / 100) * (height - 36);
          return (
            <g key={pct}>
              <line x1={30} y1={y} x2={dimensions.width - 10} y2={y}
                stroke="hsl(var(--color-border))" strokeWidth={1} strokeOpacity={0.15} />
              <text x={26} y={y + 3} textAnchor="end" fill="hsl(var(--color-muted))" fontSize={9}>
                {pct}%
              </text>
            </g>
          );
        })}
        {}
        {data.map((d, i) => {
          const barH = Math.max(2, ((d.value / maxVal) * (height - 48)));
          const x = 36 + i * (barWidth + 8);
          const y = height - 24 - barH;
          const barColor = d.color || 'url(#barGradient)';
          return (
            <g key={i}>
              <rect
                x={x} y={animate ? height - 24 : y}
                width={barWidth} height={animate ? 0 : barH}
                fill={barColor}
                rx={3}
                className={animate ? 'transition-all duration-700 ease-out' : ''}
                style={animate ? { y, height: barH } : undefined}
              />
              {showLabels && (
                <text x={x + barWidth / 2} y={height - 8} textAnchor="middle"
                  fill="hsl(var(--color-muted))" fontSize={8} fontFamily="var(--font-mono)">
                  {d.label.length > 6 ? d.label.slice(0, 5) + '…' : d.label}
                </text>
              )}
              {showValues && (
                <text x={x + barWidth / 2} y={y - 4} textAnchor="middle"
                  fill={barColor === 'url(#barGradient)' ? 'hsl(var(--color-primary))' : d.color}
                  fontSize={9} fontWeight={600} fontFamily="var(--font-mono)">
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
