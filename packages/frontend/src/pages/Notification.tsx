import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import {
  NotificationOverview, NotificationSummaryCard, NotificationRuleCard,
  NotificationProviderCard, NotificationDeliveryCard, NotificationQueueCard,
  NotificationRetryCard, NotificationRateLimitCard, NotificationDeduplicationCard,
  NotificationTemplateCard, NotificationProviderStatus, NotificationTimeline,
  NotificationActivity, NotificationFilter, NotificationSearch,
} from '../components/widgets/notification.js';
import { NotificationHistoryTable } from '../components/widgets/NotificationHistoryTable.js';
import { useNotifications } from '../hooks/useNotification.js';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';

export function NotificationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useNotifications();

  if (isLoading) {
    return <PageContainer maxWidth="xl"><SkeletonBlock lines={3} /><SkeletonBlock lines={10} /></PageContainer>;
  }
  if (isError) {
    return <PageContainer maxWidth="xl">
      <button type="button" onClick={() => void navigate('/')} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
      <ErrorState title="Failed to load notifications" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
    </PageContainer>;
  }
  if (!data) {
    return <PageContainer maxWidth="xl"><p className="text-sm text-[hsl(var(--color-muted))]">No notification data available.</p></PageContainer>;
  }

  const filteredHistory = useMemo(() => {
    let rows = data.history;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(q) || r.message.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') {
      rows = rows.filter((r) => r.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    return rows;
  }, [data.history, searchQuery, categoryFilter]);

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void navigate('/')}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label="Back to overview"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Notifications</h1>
            <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">Notification delivery tracking and management</p>
          </div>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
        </div>
        <div className="flex items-center gap-3">
          <NotificationProviderStatus providers={data.providers} />
        </div>
      </div>

      <NotificationOverview summary={data.summary} className="mb-6" />

      <DashboardGrid cols={1} colsMd={2} colsLg={3} gap="gap-4" className="mb-6">
        <NotificationSummaryCard summary={data.summary} />
        <NotificationRuleCard rules={data.rules} />
        <NotificationProviderCard providers={data.providers} />
      </DashboardGrid>

      <DashboardSection title="Delivery System" subtitle="Queue, retry, rate limiting, and deduplication status" className="mb-6">
        <DashboardGrid cols={1} colsSm={2} colsLg={4} gap="gap-4">
          <NotificationQueueCard queue={data.queue} />
          <NotificationRetryCard retry={data.retry} />
          <NotificationRateLimitCard rateLimit={data.rateLimit} />
          <NotificationDeduplicationCard dedup={data.deduplication} />
        </DashboardGrid>
      </DashboardSection>

      <DashboardGrid cols={1} colsLg={2} gap="gap-4" className="mb-6">
        <NotificationDeliveryCard stats={data.deliveryStats} />
        <NotificationTemplateCard templates={data.templates} />
      </DashboardGrid>

      <DashboardGrid cols={1} colsLg={2} gap="gap-4" className="mb-6">
        <DashboardWidgetContainer title="Notification Timeline" subtitle="24-hour activity">
          <NotificationTimeline data={data.timeline} label="Notifications Over Time" />
        </DashboardWidgetContainer>
        <DashboardWidgetContainer title="Recent Activity" subtitle="Latest notification events">
          <NotificationActivity activity={data.activity} />
        </DashboardWidgetContainer>
      </DashboardGrid>

      <DashboardSection title="Delivery History" subtitle={`${String(filteredHistory.length)} events`}>
        <DashboardWidgetContainer title="History" subtitle={`${String(filteredHistory.length)} records`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <NotificationFilter options={data.filterCategories} selected={categoryFilter} onChange={setCategoryFilter} />
            <NotificationSearch value={searchQuery} onChange={setSearchQuery} className="sm:w-64" />
          </div>
          <NotificationHistoryTable data={filteredHistory} />
        </DashboardWidgetContainer>
      </DashboardSection>
    </PageContainer>
  );
}
