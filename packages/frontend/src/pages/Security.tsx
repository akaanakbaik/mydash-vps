import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import { ArrowLeft } from 'lucide-react';
import {
  SecurityOverview, SecuritySummaryCard, SecurityScoreCard,
  SecurityThreatCard, SecurityFirewallCard, SecurityPolicyCard,
  SecurityTimeline, SecurityRecommendationCard,
  SecuritySearch, SecurityFilter, SecurityBadge, SecurityStatus, SecurityEmptyState,
} from '../components/widgets/security.js';
import { useSecurity } from '../hooks/useSecurity.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';
export function SecurityPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSecurity();
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
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Security</h1>
        </div>
        <ErrorState title="Failed to load security data" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }
  if (!data) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Security</h1>
        </div>
        <SecurityEmptyState />
      </PageContainer>
    );
  }
  const filteredEvents = useMemo(() => {
    let entries = data.events;
    if (filter !== 'all') entries = entries.filter((e) => e.severity === filter);
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((e) => e.event.toLowerCase().includes(q) || e.user.toLowerCase().includes(q) || e.ip.includes(q));
    }
    return entries;
  }, [data.events, filter, search]);
  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Security</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Monitor threats, events, and security posture</p>
        </div>
      </div>
      <SecurityOverview summary={data.summary} />
      <DashboardGrid cols={1} colsMd={2} colsLg={3} gap="gap-4" className="mt-6">
        <SecuritySummaryCard summary={data.summary} />
        <SecurityScoreCard score={data.summary.securityScore} />
        <SecurityFirewallCard firewall={data.firewall} />
      </DashboardGrid>
      <DashboardGrid cols={1} colsLg={2} gap="gap-4" className="mt-6">
        <SecurityThreatCard threats={data.threats} />
        <SecurityPolicyCard policy={data.passwordPolicy} />
      </DashboardGrid>
      <DashboardSection title="Timeline" subtitle="Security events over time" className="mt-6">
        <SecurityTimeline data={data.timeline} />
      </DashboardSection>
      <DashboardSection title="Recommendations" subtitle="Suggested security improvements" className="mt-6">
        <SecurityRecommendationCard recommendations={data.recommendations} />
      </DashboardSection>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <SecuritySearch value={search} onChange={setSearch} />
        </div>
        <SecurityFilter options={data.filterTypes} selected={filter} onChange={setFilter} />
      </div>
      <DashboardSection title="Security Events" subtitle={`${String(filteredEvents.length)} events`} className="mt-6">
        <DashboardWidgetContainer title="Events" subtitle="Detailed event log">
          {filteredEvents.length === 0 ? (
            <SecurityEmptyState title="No events" description="No security events match your criteria" />
          ) : (
            <div className="divide-y divide-[hsl(var(--color-border))]">
              {filteredEvents.slice(0, 20).map((e) => (
                <div key={e.id} className="flex items-start gap-3 py-2.5">
                  <SecurityStatus status={e.status} className="w-16 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[hsl(var(--color-text))]">{e.event}</p>
                    <p className="text-[10px] text-[hsl(var(--color-muted))]">{e.user} &middot; {e.ip} &middot; {e.location}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SecurityBadge label={e.severity} variant={e.severity} />
                    <span className="text-[10px] text-[hsl(var(--color-muted))]">{new Date(e.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardWidgetContainer>
      </DashboardSection>
    </PageContainer>
  );
}
