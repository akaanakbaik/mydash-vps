import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardSection } from '../components/widgets/DashboardGrid.js';
import {
  PluginOverview, PluginCard, PluginMarketplaceCard, PluginInstalledCard,
  PluginCategoryCard, PluginDependencyCard, PluginPermissionCard, PluginVersionCard,
  PluginSearch, PluginFilter, PluginEmptyState,
} from '../components/widgets/plugin.js';
import { PluginTable } from '../components/widgets/PluginTable.js';
import type { RecordUnknown } from '../components/widgets/types.js';
import { usePlugins } from '../hooks/usePlugin.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';
export function PluginPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = usePlugins();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  if (isLoading) {
    return <PageContainer><div className="mb-6"><SkeletonBlock lines={2} /></div><SkeletonBlock lines={10} /></PageContainer>;
  }
  if (isError) {
    return <PageContainer>
      <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
      <ErrorState title="Failed to load plugins" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
    </PageContainer>;
  }
  if (!data) {
    return <PageContainer>
      <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
      <PluginEmptyState />
    </PageContainer>;
  }
  const filteredPlugins = useMemo(() => {
    let items = data.plugins;
    if (filter) items = items.filter((p) => p.status === filter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return items;
  }, [data.plugins, filter, search]);
  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Plugins</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Extend functionality with plugins</p>
        </div>
        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
      </div>
      <PluginOverview data={data} />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PluginMarketplaceCard />
        <PluginInstalledCard />
        <PluginCategoryCard />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PluginDependencyCard />
        <PluginPermissionCard />
        <PluginVersionCard />
      </div>
      <div className="mt-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-[hsl(var(--color-foreground))]">All Plugins</h2>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Browse and manage plugins</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlugins.map((plugin) => (<PluginCard key={plugin.id} plugin={plugin} />))}
        </div>
        {filteredPlugins.length === 0 && <PluginEmptyState />}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64"><PluginSearch value={search} onChange={setSearch} /></div>
        <PluginFilter value={filter} onChange={setFilter} />
      </div>
      <DashboardSection title="Plugin Registry" subtitle="All plugins with details">          {filteredPlugins.length === 0 ? <PluginEmptyState /> : <PluginTable data={filteredPlugins as unknown as RecordUnknown[]} />}
      </DashboardSection>
    </PageContainer>
  );
}
