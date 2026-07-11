import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardSection } from '../components/widgets/DashboardGrid.js';
import {
  DockerOverview, DockerStatsCard, DockerLogsCard,
  DockerSearch, DockerFilter, DockerEmptyState,
} from '../components/widgets/docker.js';
import { DockerTable } from '../components/widgets/DockerTable.js';
import type { RecordUnknown } from '../components/widgets/types.js';
import { useDocker } from '../hooks/useDocker.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';
const dockerFilterOptions = [
  { id: 'all', label: 'All' },
  { id: 'running', label: 'Running' },
  { id: 'stopped', label: 'Stopped' },
  { id: 'paused', label: 'Paused' },
];
export function DockerPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useDocker();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--color-border))]" />
          <div><SkeletonBlock lines={2} /></div>
        </div>
        <SkeletonBlock lines={8} />
      </PageContainer>
    );
  }
  if (isError) {
    return (
      <PageContainer>
        <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
        <ErrorState title="Failed to load Docker data" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }
  if (!data) {
    return (
      <PageContainer>
        <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
        <DockerEmptyState />
      </PageContainer>
    );
  }
  const filteredContainers = useMemo(() => {
    let items = data.containers;
    if (filter !== 'all') items = items.filter((c) => c.status === filter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((c) => c.name.toLowerCase().includes(q) || c.image.toLowerCase().includes(q));
    }
    return items;
  }, [data.containers, filter, search]);
  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Docker</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Manage containers, images, and volumes</p>
        </div>
        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
      </div>
      <DockerOverview
        containerCount={data.containerCount}
        runningCount={data.runningCount}
        stoppedCount={data.stoppedCount}
        totalCpu={data.totalCpu}
        totalMemory={data.totalMemory}
      />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DockerStatsCard containers={data.containers} />
        <DockerLogsCard name="my-dash-agent" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <DockerSearch value={search} onChange={setSearch} />
        </div>
        <DockerFilter options={dockerFilterOptions} selected={filter} onChange={setFilter} />
      </div>
      <DashboardSection title="Containers" subtitle="All Docker containers">
        {filteredContainers.length === 0 ? (
          <DockerEmptyState />
        ) : (
          <DockerTable data={filteredContainers as unknown as RecordUnknown[]} />
        )}
      </DashboardSection>
    </PageContainer>
  );
}
