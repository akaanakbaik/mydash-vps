import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import {
  HealthOverview, OverallHealthCard, HealthTrendCard,
  CpuHealthCard, MemoryHealthCard, DiskHealthCard,
  NetworkHealthCard, DockerHealthCard, TunnelHealthCard,
  ServiceHealthCard, PenaltyBreakdownCard, RecoveryStatusCard,
  ConfidenceScoreCard, HealthGradeCard, HealthTimeline,
  HealthFilter, HealthSearch, HealthStatus,
} from '../components/widgets/healthScore.js';
import { HealthHistoryTable } from '../components/widgets/HealthHistoryTable.js';
import { useHealthScore } from '../hooks/useHealth.js';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { SkeletonBlock, ErrorState } from '../components/shared/Skeleton.js';
import type { HealthGrade } from '../repositories/health.js';

export function HealthScorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useHealthScore();

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
        <button onClick={() => { void navigate('/'); }} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
        <ErrorState title="Failed to load health data" action={<button onClick={() => { void refetch(); }} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer maxWidth="xl">
        <button onClick={() => { void navigate('/'); }} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
        <p className="text-sm text-[hsl(var(--color-muted))]">No health data available.</p>
      </PageContainer>
    );
  }

  const filteredHistory = useMemo(() => {
    let rows = data.history;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) => r.reason.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'critical') {
        rows = rows.filter((r) => r.grade === 'D' || r.grade === 'F');
      } else if (categoryFilter === 'good') {
        rows = rows.filter((r) => r.grade === 'A' || r.grade === 'A+');
      } else if (categoryFilter === 'warning') {
        rows = rows.filter((r) => r.grade === 'B' || r.grade === 'C');
      }
    }
    return rows;
  }, [data.history, searchQuery, categoryFilter]);

  const filterOptions = [
    { id: 'all', label: 'All Events' },
    { id: 'good', label: 'Good' },
    { id: 'warning', label: 'Warning' },
    { id: 'critical', label: 'Critical' },
  ];

  const categoryMap = data.categories.reduce<Record<string, { score: number; grade: HealthGrade; impact: number; status: string; description: string }>>(
    (acc, c) => {
      acc[c.name.toLowerCase()] = {
        score: c.score,
        grade: c.grade,
        impact: c.impact,
        status: c.status,
        description: c.description,
      };
      return acc;
    },
    {},
  );

  const cpuData = categoryMap.cpu;
  const memoryData = categoryMap.memory;
  const diskData = categoryMap.disk;
  const networkData = categoryMap.network;
  const dockerData = categoryMap.docker;
  const tunnelData = categoryMap.tunnel;
  const serviceData = categoryMap.service;

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { void navigate('/'); }}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label="Back to overview"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Health Score</h1>
            <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">Comprehensive server health evaluation</p>
          </div>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
        </div>
        <div className="flex items-center gap-3">
          <HealthStatus
            status={data.overall.category === 'excellent' ? 'healthy' : data.overall.category === 'good' ? 'healthy' : data.overall.category === 'warning' ? 'warning' : 'critical'}
          />
        </div>
      </div>

      <div className="mb-6">
        <HealthOverview overall={data.overall} categoriesCount={data.categories.length} />
      </div>

      <DashboardGrid cols={1} colsSm={2} colsLg={4} gap="gap-4" className="mb-6">
        <OverallHealthCard overall={data.overall} />
        <HealthGradeCard grade={data.grade} score={data.overall.score} />
        <ConfidenceScoreCard confidence={data.confidence} />
        <RecoveryStatusCard recovery={data.recovery} />
      </DashboardGrid>

      <DashboardGrid cols={1} colsLg={2} gap="gap-4" className="mb-6">
        <HealthTrendCard timeline={data.timeline} />
        <DashboardWidgetContainer title="Health Timeline" subtitle="Score history">
          <HealthTimeline data={data.timeline} label="Score Over Time" />
        </DashboardWidgetContainer>
      </DashboardGrid>

      <DashboardSection title="Category Health" subtitle="Detailed health breakdown by category" className="mb-6">
        <DashboardGrid cols={1} colsSm={2} colsMd={3} colsLg={4} gap="gap-4">
          <CpuHealthCard data={cpuData} />
          <MemoryHealthCard data={memoryData} />
          <DiskHealthCard data={diskData} />
          <NetworkHealthCard data={networkData} />
          <DockerHealthCard data={dockerData} />
          <TunnelHealthCard data={tunnelData} />
          <ServiceHealthCard data={serviceData} />
        </DashboardGrid>
      </DashboardSection>

      <DashboardGrid cols={1} colsLg={2} gap="gap-4" className="mb-6">
        <PenaltyBreakdownCard penalties={data.penalties} />
        <DashboardWidgetContainer title="Score Factors" subtitle="Key metrics affecting health score">
          <div className="space-y-3">
            {data.categories.map((cat) => {
              const barColor = cat.score >= 80 ? 'bg-[hsl(var(--color-success))]' : cat.score >= 60 ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-danger))]';
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[hsl(var(--color-text))]">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[hsl(var(--color-muted))]">{String(cat.score)}/100</span>
                      <span className={cn('font-medium', cat.impact >= 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
                        {cat.impact >= 0 ? '+' : ''}{cat.impact}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: String(cat.score) + '%' }}
                      role="progressbar" aria-valuenow={cat.score} aria-valuemin={0} aria-valuemax={100} aria-label={`${cat.name}: ${String(cat.score)}%`} />
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardWidgetContainer>
      </DashboardGrid>

      <DashboardSection title="Health History" subtitle="Recorded health score changes">
        <DashboardWidgetContainer title="Score Changes" subtitle={`${String(filteredHistory.length)} events`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <HealthFilter options={filterOptions} selected={categoryFilter} onChange={setCategoryFilter} />
            <HealthSearch value={searchQuery} onChange={setSearchQuery} className="sm:w-64" />
          </div>
          <HealthHistoryTable data={filteredHistory} />
        </DashboardWidgetContainer>
      </DashboardSection>
    </PageContainer>
  );
}
