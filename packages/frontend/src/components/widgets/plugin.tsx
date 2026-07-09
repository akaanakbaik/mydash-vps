import { type LucideIcon, Puzzle, CheckCircle, XCircle, AlertTriangle, RefreshCw, Download, Trash2, Settings, Shield, Box, Package, Layers, Zap, Search } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '../../utils/cn.js';
import { DashboardGrid } from './DashboardGrid.js';
import { DashboardWidgetContainer } from './DashboardWidgetContainer.js';
import { getMockPluginData, type Plugin, type PluginData } from '../../services/mockPlugin.js';

/* ─── Status & Badge ─── */

const pluginStatusConfig: Record<string, { color: string; label: string; icon: LucideIcon }> = {
  installed: { color: 'hsl(var(--color-success))', label: 'Installed', icon: CheckCircle },
  available: { color: 'hsl(var(--color-info))', label: 'Available', icon: Download },
  update_available: { color: 'hsl(var(--color-warning))', label: 'Update Available', icon: RefreshCw },
  disabled: { color: 'hsl(var(--color-muted-foreground))', label: 'Disabled', icon: XCircle },
  compatible: { color: 'hsl(var(--color-success))', label: 'Compatible', icon: CheckCircle },
  incompatible: { color: 'hsl(var(--color-danger))', label: 'Incompatible', icon: AlertTriangle },
};

export function PluginStatus({ status, showLabel }: { status: string; showLabel?: boolean }) {
  const cfg = pluginStatusConfig[status] ?? { color: 'hsl(var(--color-muted-foreground))', label: status, icon: Box };
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={'Status: ' + cfg.label}>
      <Icon className="h-4 w-4 shrink-0" style={{ color: cfg.color }} aria-hidden="true" />
      {showLabel && <span className="text-xs font-medium">{cfg.label}</span>}
    </span>
  );
}

export function PluginBadge({ label, variant }: { label: string; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const variantStyles: Record<string, string> = {
    default: 'bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]',
    success: 'bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]',
    warning: 'bg-[hsl(var(--color-warning)/0.15)] text-[hsl(var(--color-warning))]',
    danger: 'bg-[hsl(var(--color-danger)/0.15)] text-[hsl(var(--color-danger))]',
    info: 'bg-[hsl(var(--color-info)/0.15)] text-[hsl(var(--color-info))]',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4', variantStyles[variant ?? 'default'])} role="status">
      {label}
    </span>
  );
}

export function PluginEmptyState({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
      <Puzzle className="mb-4 h-12 w-12 text-[hsl(var(--color-muted-foreground))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--color-foreground))]">{title ?? 'No plugins found'}</p>
      {description && <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">{description}</p>}
    </div>
  );
}

/* ─── Search & Filter ─── */

export function PluginSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        placeholder="Search plugins..."
        className="h-9 w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] pl-9 pr-3 text-xs text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-muted-foreground))] focus:border-[hsl(var(--color-ring))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
        aria-label="Search plugins"
      />
    </div>
  );
}

export function PluginFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const filters = ['All', 'Installed', 'Available', 'Update Available', 'Disabled'];
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter plugins">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => { onChange(f === 'All' ? '' : f.toLowerCase().replace(/\s+/g, '_')); }}
          className={cn(
            'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]',
            (f === 'All' && !value) || value === f.toLowerCase().replace(/\s+/g, '_')
              ? 'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]'
              : 'bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] hover:bg-[hsl(var(--color-muted)/0.8)]'
          )}
          aria-pressed={(f === 'All' && !value) || value === f.toLowerCase().replace(/\s+/g, '_')}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

/* ─── Overview ─── */

export function PluginOverview({ data }: { data: PluginData }) {
  const stats = [
    { label: 'Total Plugins', value: data.plugins.length, icon: Package },
    { label: 'Installed', value: data.plugins.filter((p: Plugin) => p.status === 'installed').length, icon: CheckCircle },
    { label: 'Updates', value: data.plugins.filter((p: Plugin) => p.status === 'update_available').length, icon: RefreshCw },
    { label: 'Compatible', value: data.plugins.filter((p: Plugin) => p.compatible).length, icon: Zap },
  ];
  return (
    <DashboardGrid>
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <DashboardWidgetContainer key={s.label} title={s.label} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))]">
              <Icon className="h-5 w-5 text-[hsl(var(--color-primary))]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--color-muted-foreground))]">{s.label}</p>
              <p className="text-lg font-semibold text-[hsl(var(--color-foreground))]">{s.value}</p>
            </div>
          </DashboardWidgetContainer>
        );
      })}
    </DashboardGrid>
  );
}

/* ─── Plugin Card ─── */

const categoryIcons: Record<string, LucideIcon> = {
  automation: Zap,
  monitoring: Box,
  notification: Layers,
  storage: Package,
  security: Shield,
  integration: Puzzle,
};

export function PluginCard({ plugin, onAction }: { plugin: Plugin; onAction?: (name: string, action: string) => void }) {
  const CatIcon = categoryIcons[plugin.category] ?? Puzzle;
  return (
    <DashboardWidgetContainer title={plugin.name} className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))]">
            <CatIcon className="h-5 w-5 text-[hsl(var(--color-primary))]" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[hsl(var(--color-foreground))]">{plugin.name}</h4>
            <p className="text-[11px] text-[hsl(var(--color-muted-foreground))]">{plugin.version}</p>
          </div>
        </div>
        <PluginStatus status={plugin.status} showLabel />
      </div>
      <p className="text-xs text-[hsl(var(--color-muted-foreground))] line-clamp-2">{plugin.description}</p>
      <div className="flex flex-wrap items-center gap-2">
        <PluginBadge label={plugin.category} variant="info" />
        {plugin.rating >= 4.5 && <PluginBadge label="Popular" variant="warning" />}
        {!plugin.compatible && <PluginBadge label="Incompatible" variant="danger" />}
      </div>
      {plugin.status === 'available' && (
        <button
          onClick={() => onAction?.(plugin.name, 'install')}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-md bg-[hsl(var(--color-primary))] px-3 py-1.5 text-[11px] font-medium text-[hsl(var(--color-primary-foreground))] transition-colors hover:bg-[hsl(var(--color-primary)/0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label={'Install ' + plugin.name}
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Install
        </button>
      )}
      {plugin.status === 'installed' && (
        <div className="mt-1 flex gap-2">
          <button
            onClick={() => onAction?.(plugin.name, 'configure')}
            className="flex items-center justify-center gap-1.5 rounded-md bg-[hsl(var(--color-muted))] px-3 py-1.5 text-[11px] font-medium text-[hsl(var(--color-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
            aria-label={'Configure ' + plugin.name}
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            Configure
          </button>
          <button
            onClick={() => onAction?.(plugin.name, 'uninstall')}
            className="flex items-center justify-center gap-1.5 rounded-md bg-[hsl(var(--color-danger)/0.15)] px-3 py-1.5 text-[11px] font-medium text-[hsl(var(--color-danger))] transition-colors hover:bg-[hsl(var(--color-danger)/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
            aria-label={'Uninstall ' + plugin.name}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Uninstall
          </button>
        </div>
      )}
      {plugin.status === 'update_available' && (
        <button
          onClick={() => onAction?.(plugin.name, 'update')}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-md bg-[hsl(var(--color-warning)/0.15)] px-3 py-1.5 text-[11px] font-medium text-[hsl(var(--color-warning))] transition-colors hover:bg-[hsl(var(--color-warning)/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label={'Update ' + plugin.name}
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Update
        </button>
      )}
    </DashboardWidgetContainer>
  );
}

/* ─── Plugin Marketplace Card ─── */

export function PluginMarketplaceCard() {
  const data: PluginData = getMockPluginData();
  const { plugins } = data;
  const available = plugins.filter((p: Plugin) => p.status === 'available' || p.status === 'update_available');
  return (
    <DashboardWidgetContainer title="Marketplace">
      <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--color-foreground))]">Marketplace</h3>
      <div className="space-y-2">
        {available.slice(0, 5).map((p: Plugin) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-muted))] p-2.5">
            <div className="flex items-center gap-2.5">
              <CatIcon category={p.category} />
              <div>
                <p className="text-xs font-medium text-[hsl(var(--color-foreground))]">{p.name}</p>
                <p className="text-[10px] text-[hsl(var(--color-muted-foreground))]">{p.category}</p>
              </div>
            </div>
            <PluginBadge label={p.status === 'update_available' ? 'Update' : 'Available'} variant={p.status === 'update_available' ? 'warning' : 'success'} />
          </div>
        ))}
      </div>
    </DashboardWidgetContainer>
  );
}

function CatIcon({ category }: { category: string }) {
  const Icon = categoryIcons[category] ?? Puzzle;
  return <Icon className="h-4 w-4 text-[hsl(var(--color-primary))]" aria-hidden="true" />;
}

/* ─── Plugin Installed Card ─── */

export function PluginInstalledCard() {
  const data: PluginData = getMockPluginData();
  const { plugins } = data;
  const installed = plugins.filter((p: Plugin) => p.status === 'installed');
  return (
    <DashboardWidgetContainer title={'Installed (' + String(installed.length) + ')'}>
      <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--color-foreground))]">Installed ({installed.length})</h3>
      <div className="space-y-2">
        {installed.map((p: Plugin) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-muted))] p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--color-background))]">
                <Puzzle className="h-4 w-4 text-[hsl(var(--color-primary))]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--color-foreground))]">{p.name}</p>
                <p className="text-[10px] text-[hsl(var(--color-muted-foreground))]">v{p.version}</p>
              </div>
            </div>
            <button className="rounded-md p-1.5 text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-background))] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]" aria-label={'Configure ' + p.name}>
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </DashboardWidgetContainer>
  );
}

/* ─── Plugin Category Card ─── */

export function PluginCategoryCard() {
  const data: PluginData = getMockPluginData();
  const { plugins } = data;
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    plugins.forEach((p: Plugin) => map.set(p.category, (map.get(p.category) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [plugins]);
  return (
    <DashboardWidgetContainer title="Categories">
      <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--color-foreground))]">Categories</h3>
      <div className="space-y-2">
        {categories.map(([cat, count]) => (
          <div key={cat} className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-2.5">
              <CatIcon category={cat} />
              <span className="text-xs capitalize text-[hsl(var(--color-foreground))]">{cat}</span>
            </div>
            <PluginBadge label={String(count)} variant="default" />
          </div>
        ))}
      </div>
    </DashboardWidgetContainer>
  );
}

/* ─── Plugin Dependency Card ─── */

export function PluginDependencyCard() {
  const data: PluginData = getMockPluginData();
  const { plugins } = data;
  const withDeps = plugins.filter((p: Plugin) => p.dependencies.length > 0);
  return (
    <DashboardWidgetContainer title="Dependencies">
      <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--color-foreground))]">Dependencies</h3>
      {withDeps.length === 0 ? (
        <p className="text-xs text-[hsl(var(--color-muted-foreground))]">No dependencies</p>
      ) : (
        <div className="space-y-2">
          {withDeps.slice(0, 5).map((p: Plugin) => (
            <div key={p.id} className="rounded-lg bg-[hsl(var(--color-muted))] p-2.5">
              <p className="text-xs font-medium text-[hsl(var(--color-foreground))]">{p.name}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {p.dependencies.map((dep: string) => {
                  const depPlugin = plugins.find((pl: Plugin) => pl.name === dep);
                  const compatible = depPlugin?.compatible ?? true;
                  return (
                    <span
                      key={dep}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px]',
                        compatible ? 'bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))]'
                      )}
                    >
                      {dep}
                      {compatible ? <CheckCircle className="h-3 w-3" aria-hidden="true" /> : <XCircle className="h-3 w-3" aria-hidden="true" />}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardWidgetContainer>
  );
}

/* ─── Plugin Permission Card ─── */

export function PluginPermissionCard() {
  const data: PluginData = getMockPluginData();
  const { plugins } = data;
  const permissions = useMemo(() => {
    const set = new Set<string>();
    plugins.forEach((p: Plugin) => { p.permissions.forEach((perm: string) => { set.add(perm); }); });
    return Array.from(set);
  }, [plugins]);
  return (
    <DashboardWidgetContainer title="Permissions">
      <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--color-foreground))]">Permissions</h3>
      <div className="flex flex-wrap gap-1.5">
        {permissions.map((perm: string) => (
          <span
            key={perm}
            className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--color-muted))] px-2 py-1 text-[11px] text-[hsl(var(--color-foreground))]"
          >
            <Shield className="h-3 w-3 text-[hsl(var(--color-primary))]" aria-hidden="true" />
            {perm}
          </span>
        ))}
      </div>
    </DashboardWidgetContainer>
  );
}

/* ─── Plugin Version Card ─── */

export function PluginVersionCard() {
  const data: PluginData = getMockPluginData();
  const { plugins } = data;
  const withUpdates = plugins.filter((p: Plugin) => p.status === 'update_available');
  return (
    <DashboardWidgetContainer title="Version Overview">
      <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--color-foreground))]">Version Overview</h3>
      <div className="space-y-2">
        {plugins.slice(0, 6).map((p: Plugin) => (
          <div key={p.id} className="flex items-center justify-between">
            <span className="text-xs text-[hsl(var(--color-foreground))]">{p.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[hsl(var(--color-muted-foreground))]">{p.version}</span>
              {p.status === 'update_available' && (
                <PluginBadge label="Update available" variant="warning" />
              )}
            </div>
          </div>
        ))}
      </div>
      {withUpdates.length > 0 && (
        <button
          className="mt-3 w-full rounded-md bg-[hsl(var(--color-muted))] py-2 text-[11px] font-medium text-[hsl(var(--color-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Update all plugins"
        >
          Update All ({withUpdates.length})
        </button>
      )}
    </DashboardWidgetContainer>
  );
}
