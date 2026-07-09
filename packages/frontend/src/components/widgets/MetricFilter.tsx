import { cn } from '../../utils/cn.js';
import { Search, X } from 'lucide-react';

/* ─────────── Metric Filter ─────────── */

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface MetricFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  label?: string;
}

export function MetricFilter({ options, selected, onChange, className, label = 'Category' }: MetricFilterProps) {
  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(next);
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <span className="text-xs font-medium text-[hsl(var(--color-muted))] uppercase tracking-wider">{label}</span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => { toggle(opt.id); }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]',
                isActive
                  ? 'bg-[hsl(var(--color-primary))] text-white'
                  : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]',
              )}
              aria-pressed={isActive}
              aria-label={`Filter by ${opt.label}`}
            >
              {opt.label}
              {opt.count !== undefined && (
                <span className={cn(
                  'text-xs',
                  isActive ? 'text-white/70' : 'text-[hsl(var(--color-muted))]',
                )}>
                  {String(opt.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Metric Search ─────────── */

interface MetricSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MetricSearch({ value, onChange, placeholder = 'Search metrics...', className }: MetricSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-8 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
