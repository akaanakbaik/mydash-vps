import { useMemo } from 'react';
import { cn } from '../../utils/cn.js';
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}
interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLegend?: boolean;
  animate?: boolean;
  centralText?: string;
  centralSubtext?: string;
}
export function DonutChart({
  data,
  size = 140,
  strokeWidth = 24,
  className,
  showLegend = true,
  animate = true,
  centralText,
  centralSubtext,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const segments = useMemo(() => {
    let offset = 0;
    return data.map((d) => {
      const pct = total > 0 ? d.value / total : 0;
      const seg = { ...d, pct, offset, dashLength: circumference * pct };
      offset += circumference * pct;
      return seg;
    });
  }, [data, total, circumference]);
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ width: size, height: size }}>
        <span className="text-xs text-[hsl(var(--color-muted))]">No data</span>
      </div>
    );
  }
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90" role="img" aria-label="Donut chart">
        {}
        <circle cx={center} cy={center} r={radius}
          fill="none" stroke="hsl(var(--color-border))" strokeWidth={strokeWidth} opacity={0.3} />
        {}
        {segments.map((seg, i) => (
          <circle key={i} cx={center} cy={center} r={radius}
            fill="none" stroke={seg.color} strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
            className={animate ? 'transition-all duration-1000 ease-out' : ''}
            style={animate ? { strokeDashoffset: -seg.offset } : undefined}
          />
        ))}
        {}
        {centralText && (
          <text x={center} y={center - 4} textAnchor="middle"
            fill="hsl(var(--color-text))" fontSize={18} fontWeight={700}
            className="transform rotate-90" fontFamily="var(--font-sans)">
            {centralText}
          </text>
        )}
        {centralSubtext && (
          <text x={center} y={center + 14} textAnchor="middle"
            fill="hsl(var(--color-muted))" fontSize={10}
            className="transform rotate-90" fontFamily="var(--font-sans)">
            {centralSubtext}
          </text>
        )}
      </svg>
      {}
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-3 justify-center">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} aria-hidden="true" />
              <span className="text-xs text-[hsl(var(--color-muted))]">{seg.label}</span>
              <span className="text-xs font-medium text-[hsl(var(--color-text))]">
                {Math.round(seg.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
