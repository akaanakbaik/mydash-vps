import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import {
  AnalyticsSummary, AggregationCard, TrendCard,
  AnomalyCard, StatisticsCard, PercentileCard, PredictionCard,
  ResourceEfficiencyCard, AnalyticsTimeline, AnalyticsFilter,
  AnalyticsSearch, AnalyticsStatus, AnalyticsBadge,
  TimeWindowSelector,
} from '../components/widgets/analytics.js';
import { AnalyticsTable } from '../components/widgets/AnalyticsTable.js';
import { useAnalytics } from '../hooks/useAnalytics.js';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';
import type { AnalyticsRow } from '../repositories/analytics.js';

const columnHelper = createColumnHelper<AnalyticsRow>();

export function AnalyticsPage() {
  const [timeWindow, setTimeWindow] = useState('7d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useAnalytics();

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
        <ErrorState title="Failed to load analytics" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer maxWidth="xl">
        <button onClick={() => void navigate('/')} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
        <p className="text-sm text-[hsl(var(--color-muted))]">No analytics data available.</p>
      </PageContainer>
    );
  }

  const filteredData = useMemo(() => {
    let rows = data.tableData;
    if (categoryFilter !== 'all') {
      rows = rows.filter((r) => r.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) => r.metric.toLowerCase().includes(q));
    }
    return rows;
  }, [data.tableData, categoryFilter, searchQuery]);

  const columns = [
    columnHelper.accessor('metric', {
      header: 'Metric',
      cell: (info) => <span className="font-medium text-[hsl(var(--color-text))]">{info.getValue()}</span>,
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => <AnalyticsBadge label={info.getValue()} variant="info" />,
    }),
    columnHelper.accessor('avg', {
      header: 'Avg',
      cell: (info) => <span className="text-right block">{String(info.getValue())}</span>,
    }),
    columnHelper.accessor('min', {
      header: 'Min',
      cell: (info) => <span className="text-right block">{String(info.getValue())}</span>,
    }),
    columnHelper.accessor('max', {
      header: 'Max',
      cell: (info) => <span className="text-right block">{String(info.getValue())}</span>,
    }),
    columnHelper.accessor('p95', {
      header: 'P95',
      cell: (info) => <span className="text-right block">{String(info.getValue())}</span>,
    }),
    columnHelper.accessor('count', {
      header: 'Count',
      cell: (info) => <span className="text-right block">{info.getValue().toLocaleString()}</span>,
    }),
    columnHelper.display({
      id: 'trend',
      header: 'Trend',
      cell: ({ row }) => {
        const v = row.original.trend;
        return (
          <span className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            v === 'up' && 'text-[hsl(var(--color-danger))]',
            v === 'down' && 'text-[hsl(var(--color-success))]',
            v === 'stable' && 'text-[hsl(var(--color-muted))]',
          )}>
            {v === 'up' && '↑'}
            {v === 'down' && '↓'}
            {v === 'stable' && '→'}
            {v}
          </span>
        );
      },
    }),
  ] as ColumnDef<AnalyticsRow>[];

  const hasAnomalies = data.anomalies.some((a) => a.severity === 'critical' || a.severity === 'high');
  const hasWarnings = data.anomalies.length > 0;

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void navigate('/')}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label="Back to overview"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Analytics</h1>
            <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">Performance analysis, trends, and predictions</p>
          </div>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
        </div>
        <div className="flex items-center gap-3">
          <AnalyticsStatus status={hasAnomalies ? 'critical' : hasWarnings ? 'warning' : 'healthy'} />
          <TimeWindowSelector value={timeWindow} onChange={setTimeWindow} />
        </div>
      </div>

      <AnalyticsSummary data={data.summary} className="mb-6" />

      <DashboardGrid cols={1} colsLg={3} gap="gap-4" className="mb-6">
        <StatisticsCard data={data.statistics} />
        <AnomalyCard data={data.anomalies} />
        <ResourceEfficiencyCard data={data.efficiency} />
      </DashboardGrid>

      <DashboardGrid cols={1} colsLg={3} gap="gap-4" className="mb-6">
        <TrendCard data={data.trend} />
        <PredictionCard data={data.predictions} />
        <AggregationCard data={data.aggregations} />
      </DashboardGrid>

      <DashboardSection title="Percentile Distribution" subtitle="Statistical distribution of metrics" className="mb-6">
        <PercentileCard data={data.percentiles} />
      </DashboardSection>

      <DashboardSection title="Metrics Timeline" subtitle="Historical trend overview" className="mb-6">
        <DashboardWidgetContainer title="Trend History">
          <AnalyticsTimeline data={data.trend} label="Metrics Over Time" />
        </DashboardWidgetContainer>
      </DashboardSection>

      <DashboardSection title="Analytics Data" subtitle="Detailed metric statistics">
        <DashboardWidgetContainer title="Metrics Table" subtitle={`${String(filteredData.length)} metrics`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AnalyticsFilter options={data.categories} selected={categoryFilter} onChange={setCategoryFilter} />
            <AnalyticsSearch value={searchQuery} onChange={setSearchQuery} className="sm:w-64" />
          </div>
          <AnalyticsTable
            data={filteredData}
            columns={columns}
            emptyTitle="No metrics found"
            emptyDescription={searchQuery ? `No metrics matching "${searchQuery}"` : 'No metrics available'}
          />
        </DashboardWidgetContainer>
      </DashboardSection>
    </PageContainer>
  );
}
