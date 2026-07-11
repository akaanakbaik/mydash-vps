import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';
interface LoadingProps {
  className?: string;
  size?: number;
}
export function Loading({ className, size = 24 }: LoadingProps) {
  return (
    <div className={cn('flex min-h-40 items-center justify-center', className)}>
      <Loader2 className="animate-spin text-[hsl(var(--color-muted))]" style={{ width: size, height: size }} />
    </div>
  );
}
export function PageLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--color-primary))]" />
    </div>
  );
}
