import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid } from '../components/widgets/DashboardGrid.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import {
  AuditOverview, AuditSummaryCard, AuditActivityCard, AuditUserCard,
  AuditTimeline, AuditSearch, AuditFilter, AuditStatus, AuditEmptyState,
} from '../components/widgets/audit.js';
import { useAudit } from '../hooks/useAudit.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';


export function AuditPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useAudit();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

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
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Audit</h1>
        </div>
        <ErrorState title="Failed to load audit data" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
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
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Audit</h1>
        </div>
        <AuditEmptyState />
      </PageContainer>
    );
  }

  const filteredRecords = useMemo(() => {
    let entries = data.records;
    if (actionFilter !== 'all') entries = entries.filter((r) => r.action === actionFilter);
    if (userFilter !== 'all') entries = entries.filter((r) => r.user === userFilter);
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((r) => r.details.toLowerCase().includes(q) || r.user.toLowerCase().includes(q) || r.resource.toLowerCase().includes(q) || r.ip.includes(q));
    }
    return entries;
  }, [data.records, actionFilter, userFilter, search]);

  const uniqueUsers = [...new Set(data.records.map((r) => r.user))];

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Audit</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Track and review system activity</p>
        </div>
        {isFetching && (
          <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />
        )}
      </div>

      <AuditOverview summary={data.summary} />

      <DashboardGrid cols={1} colsMd={2} colsLg={3} gap="gap-4" className="mt-6">
        <AuditSummaryCard summary={data.summary} />
        <AuditUserCard users={uniqueUsers} count={data.summary.uniqueUsers} />
        <AuditActivityCard records={data.records} />
      </DashboardGrid>

      <DashboardWidgetContainer title="Audit Timeline" subtitle="24-hour activity" className="mt-6">
        <AuditTimeline data={data.timeline} />
      </DashboardWidgetContainer>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <AuditFilter options={data.filterActions} selected={actionFilter} onChange={setActionFilter} />
          <AuditFilter options={data.filterUsers} selected={userFilter} onChange={setUserFilter} />
        </div>
        <div className="w-full sm:w-64">
          <AuditSearch value={search} onChange={setSearch} />
        </div>
      </div>

      <DashboardWidgetContainer title="Audit Records" subtitle={`${String(filteredRecords.length)} records`} className="mt-6">
        {filteredRecords.length === 0 ? (
          <AuditEmptyState title="No records" description="No audit records match your criteria" />
        ) : (
          <div className="divide-y divide-[hsl(var(--color-border))] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  <th className="p-2 text-left font-medium text-[hsl(var(--color-muted))]">Status</th>
                  <th className="p-2 text-left font-medium text-[hsl(var(--color-muted))]">User</th>
                  <th className="p-2 text-left font-medium text-[hsl(var(--color-muted))]">Action</th>
                  <th className="p-2 text-left font-medium text-[hsl(var(--color-muted))]">Resource</th>
                  <th className="p-2 text-left font-medium text-[hsl(var(--color-muted))] hidden sm:table-cell">IP</th>
                  <th className="p-2 text-left font-medium text-[hsl(var(--color-muted))] hidden md:table-cell">Location</th>
                  <th className="p-2 text-right font-medium text-[hsl(var(--color-muted))]">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--color-border))]">
                {filteredRecords.slice(0, 25).map((r) => (
                  <tr key={r.id} className="hover:bg-[hsl(var(--color-bg))]/50">
                    <td className="p-2"><AuditStatus status={r.status} /></td>
                    <td className="p-2 font-medium text-[hsl(var(--color-text))]">{r.user}</td>
                    <td className="p-2 text-[hsl(var(--color-text))]">{r.action}</td>
                    <td className="p-2 text-[hsl(var(--color-muted))]">{r.resource}</td>
                    <td className="p-2 text-[hsl(var(--color-muted))] hidden sm:table-cell">{r.ip}</td>
                    <td className="p-2 text-[hsl(var(--color-muted))] hidden md:table-cell">{r.location}</td>
                    <td className="p-2 text-right text-[hsl(var(--color-muted))]">{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardWidgetContainer>
    </PageContainer>
  );
}
