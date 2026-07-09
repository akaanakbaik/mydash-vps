import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn.js';

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, error, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-[hsl(var(--color-danger))]">{error}</p>}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))] resize-y',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
