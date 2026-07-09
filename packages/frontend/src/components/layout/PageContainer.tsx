import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[90rem]',
  full: 'max-w-full',
};

export function PageContainer({ children, className, maxWidth = 'lg' }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-3 sm:px-6 py-4 sm:py-6',
        maxWidthClasses[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  );
}
