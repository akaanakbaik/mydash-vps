import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn.js';
import { X, Server } from 'lucide-react';
import { ServerStatus, ServerTags, ServerHealthCard, ServerInfoCard, ServerResourceCard, ServerLocationCard, ServerUptimeCard, ServerActionMenu } from './servers.js';
import type { Server as ServerType } from '../../services/mockServers.js';

interface ServerDetailDrawerProps {
  server: ServerType | null;
  onClose: () => void;
  onAction?: (action: string, server: ServerType) => void;
}

export function ServerDetailDrawer({ server, onClose, onAction }: ServerDetailDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (server) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [server, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity',
          server ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] shadow-xl transition-transform duration-300 overflow-y-auto',
          server ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Server details: ${server?.name ?? ''}`}
      >
        {server && (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Server className="h-5 w-5 shrink-0 text-[hsl(var(--color-primary))]" aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[hsl(var(--color-text))] truncate">{server.name}</h2>
                  <p className="text-xs text-[hsl(var(--color-muted))] truncate">{server.hostname}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Status + Tags */}
              <div className="flex items-center justify-between">
                <ServerStatus status={server.status} />
                <ServerTags tags={server.tags} />
              </div>

              {/* Detail Cards */}
              <ServerHealthCard server={server} />
              <ServerInfoCard server={server} />
              <ServerResourceCard server={server} />
              <ServerLocationCard server={server} />
              <ServerUptimeCard server={server} />

              {/* Actions */}
              <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-3">
                <h3 className="text-xs font-semibold text-[hsl(var(--color-muted))] uppercase tracking-wider mb-2 px-2">Actions</h3>
                <ServerActionMenu server={server} onAction={onAction} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
