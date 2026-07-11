import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;
interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  cols?: GridColumns;
  colsSm?: GridColumns;
  colsMd?: GridColumns;
  colsLg?: GridColumns;
  colsXl?: GridColumns;
  gap?: string;
}
const colMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};
export function DashboardGrid({
  children, className,
  cols = 1, colsSm, colsMd, colsLg, colsXl,
  gap = 'gap-6',
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid',
        colMap[cols],
        colsSm && `sm:${colMap[colsSm]}`,
        colsMd && `md:${colMap[colsMd]}`,
        colsLg && `lg:${colMap[colsLg]}`,
        colsXl && `xl:${colMap[colsXl]}`,
        gap,
        className,
      )}
    >
      {children}
    </div>
  );
}
interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}
export function DashboardSection({ title, subtitle, children, className, action }: DashboardSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[hsl(var(--color-text))]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-[hsl(var(--color-muted))]">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
}
