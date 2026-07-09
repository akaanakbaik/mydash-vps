import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardSection } from '../components/widgets/DashboardGrid.js';
import {
  TunnelOverview, TunnelStatusCard, TunnelLatencyCard,
  TunnelTrafficCard, TunnelReconnectCard, TunnelTimeline,
  TunnelEmptyState,
} from '../components/widgets/tunnel.js';
import { useTunnel } from '../hooks/useTunnel.js';
import { SkeletonBlock, ErrorState } from '../components/shared/Skeleton.js';

export function TunnelPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useTunnel();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6"><SkeletonBlock lines={2} /></div>
        <SkeletonBlock lines={8} />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
        <ErrorState title="Failed to load tunnel data" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
        <TunnelEmptyState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Tunnel</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Manage secure tunnels and public URLs</p>
        </div>
        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
      </div>

      <TunnelOverview overview={data.overview} />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TunnelStatusCard overview={data.overview} />
        <TunnelLatencyCard latency={data.overview.latency} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TunnelTrafficCard trafficIn={data.overview.trafficIn} trafficOut={data.overview.trafficOut} />
        <TunnelReconnectCard reconnects={data.reconnectHistory} />
      </div>

      <div className="mt-6">
        <TunnelTimeline data={data.timeline} />
      </div>

      <DashboardSection title="Tunnels" subtitle="All active tunnels">
        <TunnelEmptyState />
      </DashboardSection>
    </PageContainer>
  );
}
