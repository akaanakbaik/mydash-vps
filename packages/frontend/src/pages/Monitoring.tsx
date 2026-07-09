import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import {
  CpuCard, MemoryCard, DiskCard, NetworkCard, DockerCard, TunnelCard,
  MetricStatus, MetricBadge,
} from '../components/widgets/MetricCard.js';
import { MetricTable, type MetricColumn } from '../components/widgets/MetricTable.js';
import { MetricTimeline } from '../components/widgets/MetricTimeline.js';
import { MetricFilter, MetricSearch } from '../components/widgets/MetricFilter.js';
import { CollectionSummary } from '../components/widgets/CollectionStatus.js';
import { useMonitoring } from '../hooks/useMonitoring.js';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';

export function MonitoringPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['cpu', 'memory', 'network']);
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useMonitoring();

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl">
        <div className="mb-6"><SkeletonBlock lines={2} /></div>
        <SkeletonBlock lines={12} />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer maxWidth="xl">
        <button onClick={() => void navigate('/')} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
        <ErrorState title="Failed to load monitoring data" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer maxWidth="xl">
        <button onClick={() => void navigate('/')} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
        <p className="text-sm text-[hsl(var(--color-muted))]">No monitoring data available.</p>
      </PageContainer>
    );
  }

  const filteredServices = searchQuery
    ? data.services.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : data.services;

  const tableColumns: MetricColumn[] = [
    { key: 'name', label: 'Service', width: 'flex-[2]' },
    { key: 'status', label: 'Status', width: 'flex-[1.5]', render: (v) => {
      const status = String(v);
      const variant = status === 'running' ? 'success' : status === 'failed' ? 'danger' : status === 'restarting' ? 'warning' : 'info';
      return <MetricBadge label={status} variant={variant} />;
    }},
    { key: 'cpu', label: 'CPU %', align: 'right', width: 'flex-1', render: (v) => `${String(v)}%` },
    { key: 'memory', label: 'Memory', align: 'right', width: 'flex-1', render: (v) => formatMb(v as number) },
    { key: 'port', label: 'Port', align: 'right', width: 'flex-1' },
    { key: 'uptime', label: 'Uptime', width: 'flex-[1.5]' },
  ];

  const tableRows = filteredServices.map((s, i) => ({
    id: i,
    name: s.name,
    status: s.status,
    cpu: s.cpu,
    memory: s.memory,
    port: s.port,
    uptime: s.uptime,
  }));

  const hasCritical = data.services.some((s) => s.status === 'failed')
    || data.disks.some((d) => d.usagePercent > 85)
    || data.tunnel.status !== 'connected';
  const hasWarning = data.services.some((s) => s.status === 'stopped')
    || data.disks.some((d) => d.usagePercent > 70)
    || data.cpu.usagePercent > 60;

  const systemStatus: 'healthy' | 'warning' | 'critical' = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void navigate('/')}
              className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
              aria-label="Back to overview"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Monitoring</h1>
              <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">Real-time system metrics and health</p>
            </div>
            {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MetricStatus status={systemStatus} className="mr-2" />
          <MetricBadge label={data.collection.status} variant={
            data.collection.status === 'success' ? 'success' :
            data.collection.status === 'error' ? 'danger' : 'primary'
          } />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-5 py-3">
        <CollectionSummary
          status={data.collection.status}
          lastUpdated={data.collection.lastUpdated}
          errors={data.collection.errors}
          summary={data.collection.summary}
        />
      </div>

      <DashboardSection title="System Resources" subtitle="Real-time metric overview" className="mb-6">
        <DashboardGrid cols={1} colsSm={2} colsLg={3} colsXl={4} gap="gap-4">
          {selectedCategories.includes('cpu') && <CpuCard data={data.cpu} />}
          {selectedCategories.includes('memory') && <MemoryCard data={data.memory} />}
          {selectedCategories.includes('disk') && data.disks.slice(0, 2).map((disk) => (
            <DiskCard key={disk.device} data={disk} />
          ))}
          {selectedCategories.includes('network') && <NetworkCard data={data.network} />}
          {selectedCategories.includes('docker') && <DockerCard data={data.docker} />}
          {selectedCategories.includes('tunnel') && <TunnelCard data={data.tunnel} />}
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection title="Metrics Trend" subtitle="Historical data over time" className="mb-6">
        <DashboardWidgetContainer title="Metric Timeline" subtitle="24-hour history">
          <MetricFilter
            options={data.categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
            className="mb-4"
          />
          <MetricTimeline data={data.timeline} />
        </DashboardWidgetContainer>
      </DashboardSection>

      <DashboardSection title="System Services" subtitle="Running services and processes">
        <DashboardWidgetContainer title="Services" subtitle={`${String(filteredServices.length)} services`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <MetricFilter
              options={data.categories.filter((c) => c.id === 'services')}
              selected={selectedCategories.filter((c) => c === 'services')}
              onChange={() => {}}
              label=""
            />
            <MetricSearch value={searchQuery} onChange={setSearchQuery} className="sm:w-64" />
          </div>
          <MetricTable
            columns={tableColumns}
            rows={tableRows}
            emptyTitle="No services found"
            emptyDescription={searchQuery ? `No services matching "${searchQuery}"` : 'No services available'}
          />
        </DashboardWidgetContainer>
      </DashboardSection>
    </PageContainer>
  );
}

function formatMb(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${String(Math.round(mb))} MB`;
}
