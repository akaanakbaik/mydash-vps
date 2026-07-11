import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardSection } from '../components/widgets/DashboardGrid.js';
import {
  BackupOverview, BackupSummaryCard, BackupStorageCard,
  BackupScheduleCard, BackupRestoreCard, BackupProgressCard,
  BackupTimeline, BackupSearch, BackupFilter, BackupEmptyState, BackupActivity,
} from '../components/widgets/backup.js';
import { BackupTable } from '../components/widgets/BackupTable.js';
import type { RecordUnknown } from '../components/widgets/types.js';
import { useBackupSummary } from '../hooks/useBackup.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';
export function BackupPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useBackupSummary();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--color-border))]" />
          <div><SkeletonBlock lines={2} /></div>
        </div>
        <SkeletonBlock lines={6} />
      </PageContainer>
    );
  }
  if (isError) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Backup</h1>
        </div>
        <ErrorState title="Failed to load backup data" message="Unable to fetch backup information from the server." action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }
  if (!data) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Backup</h1>
        </div>
        <BackupEmptyState />
      </PageContainer>
    );
  }
  const running = data.backups.filter((b) => b.status === 'running').length;
  const total = data.backups.length;
  const filteredHistory = data.backups.filter((e) => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Backup</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Manage backups and restore points</p>
        </div>
      </div>
      <BackupOverview summary={data.summary} />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BackupSummaryCard summary={data.summary} />
        <BackupStorageCard storageUsed={data.summary.storageUsed} storageTotal={data.summary.storageTotal} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BackupScheduleCard retention={data.retention} nextScheduled={data.summary.nextScheduled} />
        <BackupProgressCard running={running} total={total} status={running > 0 ? 'running' : 'completed'} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4">
        <BackupRestoreCard restores={data.restores} />
      </div>
      <DashboardSection title="Timeline" subtitle="Backup activity over time">
        <BackupTimeline data={data.timeline} />
      </DashboardSection>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <BackupSearch value={search} onChange={setSearch} />
        </div>
        <BackupFilter options={data.filterTypes} selected={filter} onChange={setFilter} />
      </div>
      <DashboardSection title="History" subtitle="All backup operations">
        {filteredHistory.length === 0 ? (
          <BackupEmptyState />
        ) : (
          <BackupTable data={filteredHistory as unknown as RecordUnknown[]} />
        )}
      </DashboardSection>
      <DashboardSection title="Activity" subtitle="Recent backup events">
        <BackupActivity activity={data.activity} />
      </DashboardSection>
    </PageContainer>
  );
}
