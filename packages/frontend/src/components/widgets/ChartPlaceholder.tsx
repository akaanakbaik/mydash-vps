import { BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn.js';
interface ChartPlaceholderProps {
  label?: string;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'line' | 'bar' | 'area';
}
const heights: Record<string, string> = {
  sm: 'h-24',
  md: 'h-36',
  lg: 'h-48',
};
export function ChartPlaceholder({ label = 'Chart', height = 'md', className }: ChartPlaceholderProps) {
  return (
    <div className={cn('skeuo-inset flex flex-col items-center justify-center gap-2 rounded-xl px-4 text-center', heights[height], className)} role="img" aria-label={`${label}: no data`}>
      <BarChart3 className="h-5 w-5 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <p className="text-xs font-medium text-[hsl(var(--color-text))]">{label}</p>
      <p className="text-[10px] text-[hsl(var(--color-muted))]">No historical data available</p>
    </div>
  );
}
