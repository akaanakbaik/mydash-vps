import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import {
  ServerOverview, ServerCard, ServerEmptyState,
  ServerSearch, ServerFilter, ServerSort,
} from '../components/widgets/servers.js';
import { ServerTable } from '../components/widgets/ServerTable.js';
import { ServerDetailDrawer } from '../components/widgets/ServerDetailDrawer.js';
import { useServers } from '../hooks/useServer.js';
import { LayoutGrid, List, ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';
import type { Server } from '../repositories/server.js';

export function ServersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useServers();

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl">
        <div className="mb-6"><SkeletonBlock lines={2} /></div>
        <SkeletonBlock lines={10} />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer maxWidth="xl">
        <button onClick={() => { void navigate('/'); }} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
        <ErrorState title="Failed to load servers" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer maxWidth="xl">
        <button onClick={() => { void navigate('/'); }} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
        <ServerEmptyState />
      </PageContainer>
    );
  }

  const filteredServers = useMemo(() => {
    let rows = data.servers;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.hostname.toLowerCase().includes(q) ||
        s.ipv4.includes(q) ||
        s.tags.some((t) => t.includes(q))
      );
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((s) => s.status === statusFilter);
    }
    rows = [...rows].sort((a, b) => {
      switch (sortBy) {
        case 'health': return b.healthScore - a.healthScore;
        case 'cpu': return b.cpuUsage - a.cpuUsage;
        case 'ram': return b.ramUsage - a.ramUsage;
        case 'uptime': return a.uptime.localeCompare(b.uptime);
        default: return a.name.localeCompare(b.name);
      }
    });
    return rows;
  }, [data.servers, searchQuery, statusFilter, sortBy]);

  const handleSelectServer = useCallback((server: Server) => {
    setSelectedServer(server);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedServer(null);
  }, []);

  const handleAction = useCallback((_action: string, _server: Server) => {
    if (_action === 'restart') {
      // Server restart dispatched via realtime
    } else if (_action === 'view') {
      setSelectedServer(_server);
    }
  }, []);

  const filterOptions = [
    { id: 'all', label: 'All Servers' },
    ...data.statusOptions,
  ];

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { void navigate('/'); }}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label="Back to overview"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Servers</h1>
            <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">Manage and monitor all connected servers</p>
          </div>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
        </div>
      </div>

      <ServerOverview
        totalCount={data.totalCount}
        onlineCount={data.onlineCount}
        offlineCount={data.offlineCount}
        degradedCount={data.degradedCount}
        avgHealthScore={data.avgHealthScore}
        totalCores={data.totalCores}
        className="mb-6"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ServerFilter options={filterOptions} selected={statusFilter} onChange={setStatusFilter} />
          <ServerSort value={sortBy} onChange={setSortBy} />
        </div>
        <div className="flex items-center gap-3">
          <ServerSearch value={searchQuery} onChange={setSearchQuery} className="sm:w-64" />
          <div className="flex items-center gap-1 rounded-lg bg-[hsl(var(--color-bg))] p-0.5">
            <button type="button" onClick={() => { setViewMode('grid'); }}
              className={cn('rounded-md p-1.5 transition-colors', viewMode === 'grid' ? 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))]' : 'text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]')}
              aria-label="Grid view" aria-pressed={viewMode === 'grid'}><LayoutGrid className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => { setViewMode('list'); }}
              className={cn('rounded-md p-1.5 transition-colors', viewMode === 'list' ? 'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))]' : 'text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]')}
              aria-label="List view" aria-pressed={viewMode === 'list'}><List className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <DashboardSection title={`Servers (${String(filteredServers.length)})`}>
          {filteredServers.length === 0 ? (
            <ServerEmptyState />
          ) : (
            <DashboardGrid cols={1} colsSm={2} colsMd={3} colsLg={4} gap="gap-4">
              {filteredServers.map((server) => (
                <ServerCard key={server.id} server={server} onSelect={handleSelectServer} />
              ))}
            </DashboardGrid>
          )}
        </DashboardSection>
      ) : (
        <DashboardWidgetContainer title="Server List" subtitle={`${String(filteredServers.length)} servers`}>
          <ServerTable data={filteredServers} onSelect={handleSelectServer} />
        </DashboardWidgetContainer>
      )}

      <ServerDetailDrawer server={selectedServer} onClose={handleCloseDrawer} onAction={handleAction} />
    </PageContainer>
  );
}
