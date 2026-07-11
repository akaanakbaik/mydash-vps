import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import {
  SessionOverview, CurrentSessionCard, TrustedDeviceCard,
  SessionSearch, SessionFilter, SessionBadge, SessionStatus, SessionEmptyState,
} from '../components/widgets/session.js';
import { useSessions } from '../hooks/useSession.js';
import { useRevokeSessionMutation } from '../hooks/mutations.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';
export function SessionPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useSessions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
          <button onClick={() => { void navigate('/'); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Sessions</h1>
        </div>
        <ErrorState title="Failed to load sessions" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }
  if (!data) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => { void navigate('/'); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Sessions</h1>
        </div>
        <SessionEmptyState />
      </PageContainer>
    );
  }
  const revokeMutation = useRevokeSessionMutation();
  const handleRevoke = useCallback((sessionId: string, sessionName: string) => {
    if (window.confirm(`Revoke session "${sessionName}"? This will log out that device.`)) {
      revokeMutation.mutate(sessionId);
    }
  }, [revokeMutation]);
  const currentSession = data.sessions.find((s) => s.isCurrent);
  const otherSessions = data.sessions.filter((s) => !s.isCurrent);
  const filteredSessions = useMemo(() => {
    let entries = otherSessions;
    if (statusFilter !== 'all') entries = entries.filter((s) => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((s) => s.name.toLowerCase().includes(q) || s.device.toLowerCase().includes(q) || s.ip.includes(q));
    }
    return entries;
  }, [otherSessions, statusFilter, search]);
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
    { id: 'revoked', label: 'Revoked' },
  ];
  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => { void navigate('/'); }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Sessions</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Manage your active sessions and trusted devices</p>
        </div>
        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
      </div>
      <SessionOverview summary={data.summary} />
      <DashboardGrid cols={1} colsLg={2} gap="gap-6" className="mt-6">
        {currentSession && <CurrentSessionCard session={currentSession} />}
        <DashboardWidgetContainer title="Trusted Devices" subtitle="Devices that can bypass 2FA">
          {data.sessions.filter((s) => s.isTrusted).length === 0 ? (
            <SessionEmptyState title="No trusted devices" description="No trusted devices configured" />
          ) : (
            <div className="space-y-2">
              {data.sessions.filter((s) => s.isTrusted).slice(0, 4).map((s) => (
                <TrustedDeviceCard key={s.id} device={s} />
              ))}
            </div>
          )}
        </DashboardWidgetContainer>
      </DashboardGrid>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SessionFilter options={filterOptions} selected={statusFilter} onChange={setStatusFilter} />
        <div className="w-full sm:w-64">
          <SessionSearch value={search} onChange={setSearch} />
        </div>
      </div>
      <DashboardSection title="All Sessions" subtitle={`${String(filteredSessions.length)} sessions`} className="mt-6">
        {filteredSessions.length === 0 ? (
          <SessionEmptyState title="No sessions" description="No sessions match your criteria" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[hsl(var(--color-border))]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">Name</th>
                  <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">Type</th>
                  <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">Status</th>
                  <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))] hidden sm:table-cell">Device</th>
                  <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))] hidden md:table-cell">IP</th>
                  <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))] hidden lg:table-cell">Location</th>
                  <th className="p-3 text-right font-medium text-[hsl(var(--color-muted))]">Last Active</th>
                  <th className="p-3 text-right font-medium text-[hsl(var(--color-muted))] w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--color-border))]">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-[hsl(var(--color-bg))]/50">
                    <td className="p-3 font-medium text-[hsl(var(--color-text))]">{s.name}</td>
                    <td className="p-3"><SessionBadge label={s.type} variant={s.type} /></td>
                    <td className="p-3"><SessionStatus status={s.status} /></td>
                    <td className="p-3 text-[hsl(var(--color-muted))] hidden sm:table-cell">{s.device}</td>
                    <td className="p-3 text-[hsl(var(--color-muted))] hidden md:table-cell">{s.ip}</td>
                    <td className="p-3 text-[hsl(var(--color-muted))] hidden lg:table-cell">{s.location}</td>
                    <td className="p-3 text-right text-[hsl(var(--color-muted))]">{new Date(s.lastActive).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      {s.status === 'active' && !s.isCurrent && (
                        <button
                          type="button"
                          onClick={() => { handleRevoke(s.id, s.name); }}
                          disabled={revokeMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                          aria-label={`Revoke session ${s.name}`}
                        >
                          <LogOut className="h-3 w-3" aria-hidden="true" />
                          {revokeMutation.isPending ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>
    </PageContainer>
  );
}
