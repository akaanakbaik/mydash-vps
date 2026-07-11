import { useMemo } from 'react';
import { cn } from '../../utils/cn.js';
interface HeatmapData {
  date: string; 
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}
interface HeatmapCalendarProps {
  data: HeatmapData[];
  className?: string;
}
const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-[hsl(var(--color-border))]/20',
  1: 'bg-[hsl(var(--color-primary))]/20',
  2: 'bg-[hsl(var(--color-primary))]/40',
  3: 'bg-[hsl(var(--color-primary))]/60',
  4: 'bg-[hsl(var(--color-primary))]',
};
const LEVEL_LABELS: Record<number, string> = {
  0: 'No activity',
  1: 'Low activity',
  2: 'Medium activity',
  3: 'High activity',
  4: 'Very high activity',
};
const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
export function HeatmapCalendar({ data, className }: HeatmapCalendarProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 364); 
    const dataMap = new Map<string, number>();
    for (const d of data) {
      dataMap.set(d.date, d.level);
    }
    const weeks: Array<Array<{ date: string; level: number; count: number }>> = [];
    const monthLabels: Array<{ label: string; index: number }> = [];
    const current = new Date(start);
    const dayOfWeek = current.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    current.setDate(current.getDate() + diff);
    let weekIndex = 0;
    let lastMonth = -1;
    while (current < end) {
      const week: Array<{ date: string; level: number; count: number }> = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        const entry = dataMap.get(dateStr);
        const level = entry !== undefined ? (entry as number) : 0;
        week.push({ date: dateStr, level, count: entry ?? 0 });
        current.setDate(current.getDate() + 1);
      }
      if (weekIndex === 0 || current.getMonth() !== lastMonth) {
        if (current.getMonth() !== lastMonth || weekIndex === 0) {
          monthLabels.push({ label: current.toLocaleDateString('en-US', { month: 'short' }), index: weekIndex });
        }
      }
      lastMonth = current.getMonth();
      weeks.push(week);
      weekIndex++;
    }
    return { weeks, monthLabels };
  }, [data]);
  const totalActive = data.filter(d => d.level > 0).length;
  const maxActivity = Math.max(...data.map(d => d.count), 1);
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs text-[hsl(var(--color-muted))]">
        <span>{totalActive} active days in the last year</span>
        <span>Max: {maxActivity} events/day</span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {}
          <div className="flex flex-col gap-[3px] pt-5 pr-1">
            {DAYS.map((day, i) => (
              <span key={i} className="h-3 text-[9px] leading-3 text-[hsl(var(--color-muted))]">{day}</span>
            ))}
          </div>
          {}
          <div className="flex gap-[3px]">
            {monthLabels.map((ml, i) => (
              <div key={i} style={{ gridColumn: `${ml.index + 1}` }} className="text-[9px] text-[hsl(var(--color-muted))] mb-[2px]">
                {ml.label}
              </div>
            ))}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={cn(
                      'h-3 w-3 rounded-[3px] transition-colors duration-200',
                      LEVEL_COLORS[day.level as keyof typeof LEVEL_COLORS] ?? LEVEL_COLORS[0],
                    )}
                    title={`${day.date}: ${day.count} events (${LEVEL_LABELS[day.level as keyof typeof LEVEL_LABELS] ?? 'No activity'})`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {}
      <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--color-muted))]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div key={level} className={cn('h-3 w-3 rounded-[3px]', LEVEL_COLORS[level])} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
export function generateMockHeatmapData(): HeatmapData[] {
  const data: HeatmapData[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = Math.floor(Math.random() * 20);
    const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 8 ? 2 : count <= 15 ? 3 : 4;
    data.push({ date: dateStr, count, level: level as 0 | 1 | 2 | 3 | 4 });
  }
  return data;
}
