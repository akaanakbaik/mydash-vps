import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  formatter?: (value: number) => string;
}
export function AnimatedNumber({
  value,
  duration = 500,
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
  formatter,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }
    setIsAnimating(true);
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        prevValueRef.current = endValue;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);
  const formatted = formatter
    ? formatter(displayValue)
    : `${prefix}${displayValue.toFixed(decimals)}${suffix}`;
  return (
    <span
      className={cn(
        'inline-block tabular-nums transition-colors',
        isAnimating && 'scale-in-center',
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {formatted}
    </span>
  );
}
interface AnimatedStatCardProps {
  label: string;
  value: number;
  unit?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  decimals?: number;
  className?: string;
}
const colorMap: Record<string, string> = {
  primary: 'from-[hsl(var(--color-primary))/20] to-[hsl(var(--color-primary))/5] border-[hsl(var(--color-primary))/30]',
  success: 'from-[hsl(var(--color-success))/20] to-[hsl(var(--color-success))/5] border-[hsl(var(--color-success))/30]',
  warning: 'from-[hsl(var(--color-warning))/20] to-[hsl(var(--color-warning))/5] border-[hsl(var(--color-warning))/30]',
  danger: 'from-[hsl(var(--color-danger))/20] to-[hsl(var(--color-danger))/5] border-[hsl(var(--color-danger))/30]',
  info: 'from-[hsl(var(--color-accent))/20] to-[hsl(var(--color-accent))/5] border-[hsl(var(--color-accent))/30]',
};
const textColorMap: Record<string, string> = {
  primary: 'text-[hsl(var(--color-primary))]',
  success: 'text-[hsl(var(--color-success))]',
  warning: 'text-[hsl(var(--color-warning))]',
  danger: 'text-[hsl(var(--color-danger))]',
  info: 'text-[hsl(var(--color-accent))]',
};
export function AnimatedStatCard({
  label,
  value,
  unit = '',
  icon,
  trend,
  color = 'primary',
  decimals = 0,
  className,
}: AnimatedStatCardProps) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? 'text-[hsl(var(--color-danger))]' : trend === 'down' ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-muted))]';
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:shadow-md',
        colorMap[color] ?? colorMap.primary,
        'group',
        className,
      )}
    >
      {}
      <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[hsl(var(--color-muted))]">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={cn('text-2xl font-bold tracking-tight', textColorMap[color] ?? textColorMap.primary)}>
              <AnimatedNumber value={value} decimals={decimals} />
            </span>
            {unit && <span className="text-sm text-[hsl(var(--color-muted))]">{unit}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={cn('text-sm font-medium', trendColor)}>
              {trendIcon}
            </span>
          )}
          {icon && (
            <div className={cn('rounded-lg p-2', textColorMap[color] ?? textColorMap.primary, 'bg-[hsl(var(--color-bg))]/50')}>
              {icon}
            </div>
          )}
        </div>
      </div>
      {}
      <div className="mt-3 h-0.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            textColorMap[color]?.replace('text', 'bg') ?? 'bg-[hsl(var(--color-primary))]',
          )}
          style={{
            width: `${Math.min(Math.abs(value), 100)}%`,
            animation: 'shimmer 2s infinite linear',
          }}
        />
      </div>
    </div>
  );
}
export function LivePulseDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-2 w-2', className)} aria-label="Live">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--color-success))] opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--color-success))]" />
    </span>
  );
}
export function useAutoRefresh(
  refetch: () => Promise<unknown>,
  intervalMs: number,
  enabled = true,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const tick = () => { void refetch(); };
    intervalRef.current = setInterval(tick, intervalMs);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch, intervalMs, enabled]);
  const manualRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);
  return { manualRefresh };
}
