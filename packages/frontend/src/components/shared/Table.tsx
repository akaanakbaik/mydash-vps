import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return <table className={cn('w-full text-sm', className)}>{children}</table>;
}

export function TableHeader({ children, className }: TableProps) {
  return <thead className={cn('border-b border-[hsl(var(--color-border))]', className)}>{children}</thead>;
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn('divide-y divide-[hsl(var(--color-border))]', className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return <tr className={cn('transition-colors', className)}>{children}</tr>;
}

export function TableHead({ children, className }: TableProps) {
  return <th className={cn('p-3 text-left text-xs font-medium uppercase text-[hsl(var(--color-muted))]', className)}>{children}</th>;
}

export function TableCell({ children, className }: TableProps) {
  return <td className={cn('p-3', className)}>{children}</td>;
}
