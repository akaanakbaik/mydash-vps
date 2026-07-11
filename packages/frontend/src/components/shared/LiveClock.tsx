import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn.js';
interface LiveClockProps {
  format?: 'HH:mm:ss' | 'HH:mm' | 'full';
  className?: string;
}
function formatClock(date: Date, fmt: string): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  switch (fmt) {
    case 'HH:mm':
      return `${hh}:${mm}`;
    case 'full': {
      const day = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      return `${day} ${hh}:${mm}:${ss}`;
    }
    case 'HH:mm:ss':
    default:
      return `${hh}:${mm}:${ss}`;
  }
}
export function LiveClock({ format = 'HH:mm:ss', className }: LiveClockProps) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <time
      className={cn('tabular-nums', className)}
      dateTime={time.toISOString()}
      aria-label={`Current time: ${formatClock(time, format)}`}
    >
      {formatClock(time, format)}
    </time>
  );
}
