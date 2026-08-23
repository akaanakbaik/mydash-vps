import { MonitorCog } from 'lucide-react';
import { findDistroAsset } from '../../assets/distro/catalog.js';

type DistroBadgeProps = {
  distro?: string;
  kernel?: string;
  className?: string;
};

export function DistroBadge({ distro = 'Unknown operating system', kernel = 'Unknown kernel', className = '' }: DistroBadgeProps) {
  const asset = findDistroAsset(distro);
  const displayName = asset?.name ?? distro;

  return (
    <div className={`skeuo-inset flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 ${className}`}>
      <div className="flex h-14 min-w-20 max-w-32 shrink-0 items-center justify-center rounded-xl border border-[#d9d0c0] bg-[#f5f1e8] px-2 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_7px_14px_rgba(0,0,0,.18)]">
        {asset ? (
          <img
            src={asset.src}
            alt={`${asset.name} official logo`}
            title={`Sumber: ${asset.sourceUrl}`}
            className={asset.shape === 'square' ? 'h-10 w-10 object-contain' : 'max-h-9 w-full object-contain'}
          />
        ) : (
          <MonitorCog className="h-8 w-8 text-[#59616b]" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[hsl(var(--color-text))]">{displayName}</p>
        <p className="truncate text-[11px] text-[hsl(var(--color-muted))]">Kernel {kernel}</p>
        <p className="truncate text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--color-muted))]">{asset ? 'Official asset' : 'Detected OS'}</p>
      </div>
    </div>
  );
}
