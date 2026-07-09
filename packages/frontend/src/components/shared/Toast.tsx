import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn.js';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors: Record<ToastType, string> = {
  success: 'border-[hsl(var(--color-success))]',
  error: 'border-[hsl(var(--color-danger))]',
  warning: 'border-[hsl(var(--color-warning))]',
  info: 'border-[hsl(var(--color-primary))]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((t) => { const next = [...t, { id, type, message }]; return next; });
    setTimeout(() => { setToasts((t) => t.filter((toast) => toast.id !== id)); }, 5000);
  }, []);

  const removeToast = (id: string) => { setToasts((t) => t.filter((toast) => toast.id !== id)); };

  return (
    <ToastContext value={{ addToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={cn('flex items-start gap-3 rounded-lg border bg-[hsl(var(--color-surface))] p-4 shadow-lg min-w-80', colors[toast.type])}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm">{toast.message}</p>
              <button onClick={() => { removeToast(toast.id); }} className="text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
