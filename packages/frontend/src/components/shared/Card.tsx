import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-6', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>;
}
