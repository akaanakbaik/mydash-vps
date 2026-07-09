import { cn } from '../../utils/cn.js';
import { LineChart } from 'lucide-react';

interface ChartPlaceholderProps {
  label?: string;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'line' | 'bar' | 'area';
}

const heights: Record<string, string> = {
  sm: 'h-20',
  md: 'h-32',
  lg: 'h-48',
};

export function ChartPlaceholder({
  label = 'Chart',
  height = 'md',
  className,
  variant = 'line',
}: ChartPlaceholderProps) {
  const dots = variant === 'line'
    ? 'M0,40 Q10,20 20,35 Q30,50 40,30 Q50,10 60,25 Q70,40 80,20 Q90,30 100,25'
    : variant === 'area'
      ? 'M0,40 Q10,20 20,35 Q30,50 40,30 Q50,10 60,25 Q70,40 80,20 Q90,30 100,25 L100,50 L0,50 Z'
      : 'M5,45 L5,25 M15,45 L15,15 M25,45 L25,30 M35,45 L35,10 M45,45 L45,20 M55,45 L55,35 M65,45 L65,5 M75,45 L75,25 M85,45 L85,15 M95,45 L95,30';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-lg border border-dashed border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))]/50',
        heights[height],
        className,
      )}
      role="img"
      aria-label={`${label} chart placeholder`}
    >
      <svg
        className="absolute inset-0 h-full w-full p-2"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={dots}
          fill={variant === 'area' ? 'hsl(var(--color-primary) / 0.08)' : 'none'}
          stroke="hsl(var(--color-primary) / 0.3)"
          strokeWidth={variant === 'bar' ? 4 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative flex items-center gap-1.5 rounded-md bg-[hsl(var(--color-surface))] px-2.5 py-1 text-xs text-[hsl(var(--color-muted))] shadow-sm">
        <LineChart className="h-3 w-3" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}
