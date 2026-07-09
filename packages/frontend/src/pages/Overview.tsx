import { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardWidgetContainer, SummaryCard, TimeRangeSelector } from '../components/widgets/DashboardWidgetContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { StatusBanner } from '../components/widgets/StatusBanner.js';
import { RecentActivityPanel } from '../components/widgets/RecentActivityPanel.js';
import { RecentAlertsPanel } from '../components/widgets/RecentAlertsPanel.js';
import { QuickActions } from '../components/widgets/QuickActions.js';
import { SystemStatusPanel } from '../components/widgets/SystemStatusPanel.js';
import { Server, HeartPulse, Bell, Bot, Cpu, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { useDashboard } from '../hooks/useOverview.js';
import { SkeletonBlock, Skeleton } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';

function formatBytes(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${String(mb)} MB`;
}

function ResourceBar({ used, total, label, unit, color = 'primary' }: {
  used: number; total: number; label: string; unit: string; color?: string;
}) {
  const percent = Math.min((used / total) * 100, 100);
  const colorClass = color === 'danger'
    ? 'bg-[hsl(var(--color-danger))]'
    : color === 'warning'
      ? 'bg-[hsl(var(--color-warning))]'
      : 'bg-[hsl(var(--color-primary))]';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[hsl(var(--color-text))]">{label}</span>
        <span className="text-[hsl(var(--color-muted))]">
          {unit === '%' ? `${String(used)}%` : `${formatBytes(used)} / ${formatBytes(total)}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[hsl(var(--color-border))] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${String(percent)}%` }}
          role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
          aria-label={`${label}: ${String(Math.round(percent))}%`} />
      </div>
    </div>
  );
}

export function OverviewPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const { data, isLoading, isError, isFetching, refetch } = useDashboard();

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl">
        <SkeletonBlock lines={3} />
        <Skeleton className="mt-6 h-48 w-full" />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer maxWidth="xl">
        <ErrorState title="Failed to load dashboard" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer maxWidth="xl">
        <p className="text-sm text-[hsl(var(--color-muted))]">No dashboard data available.</p>
      </PageContainer>
    );
  }

  const getResourceColor = (percent: number): string => {
    if (percent >= 90) return 'danger';
    if (percent >= 70) return 'warning';
    return 'primary';
  };

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Overview</h1>
            <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">{data.server.hostname} · {data.server.os}</p>
          </div>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
        </div>
        <TimeRangeSelector value={timeRange} onChange={(v: string) => { setTimeRange(v); }} />
      </div>

      {data.health.score < 70 && (
        <StatusBanner variant="error" title="System health is degraded"
          description={`Health score is ${String(data.health.score)}/100. Check active alerts for details.`} className="mb-6" />
      )}
      {data.health.score >= 70 && data.health.score < 85 && (
        <StatusBanner variant="warning" title="System health needs attention"
          description={`Health score is ${String(data.health.score)}/100. Some factors require review.`} className="mb-6" />
      )}
      {data.health.score >= 85 && (
        <StatusBanner variant="success" title="All systems operational"
          description={`Health score is ${String(data.health.score)}/100. Server is running normally.`} className="mb-6" />
      )}

      <DashboardSection title="Summary" subtitle="System overview at a glance" className="mb-6">
        <DashboardGrid cols={1} colsSm={2} colsLg={3} colsXl={5} gap="gap-3">
          <SummaryCard label="Server Status" value={data.server.hostname} subtitle={`Up ${data.server.uptime}`} icon={<Server className="h-5 w-5" />} color="primary" />
          <SummaryCard label="Health Score" value={String(data.health.score)}
            subtitle={`Grade ${data.health.grade} · ${data.health.trend === 'up' ? 'Improving' : data.health.trend === 'down' ? 'Declining' : 'Stable'}`}
            icon={<HeartPulse className="h-5 w-5" />} color={data.health.score >= 80 ? 'success' : data.health.score >= 60 ? 'warning' : 'danger'} trend={data.health.trend} />
          <SummaryCard label="CPU Load" value={`${String(data.resources[0].used)}%`} subtitle={`${String(data.server.cpuCores)} cores`}
            icon={<Cpu className="h-5 w-5" />} color={data.resources[0].used > 80 ? 'danger' : data.resources[0].used > 60 ? 'warning' : 'success'} />
          <SummaryCard label="Notifications" value={data.notificationSummary.unread.toString()} subtitle={`${String(data.notificationSummary.failed)} failed`}
            icon={<Bell className="h-5 w-5" />} color={data.notificationSummary.failed > 0 ? 'warning' : 'info'} />
          <SummaryCard label="Automations" value={data.automationSummary.active.toString()} subtitle={`${String(data.automationSummary.running)} running`}
            icon={<Bot className="h-5 w-5" />} color="primary" />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection title="System" subtitle="Resource usage and health" className="mb-6">
        <DashboardGrid cols={1} colsLg={3} gap="gap-6">
          <DashboardWidgetContainer title="Resource Usage" subtitle="Real-time system metrics" className="lg:col-span-1">
            <div className="space-y-4">
              {data.resources.map((res) => (
                <ResourceBar key={res.label} label={res.label} used={res.used} total={res.total} unit={res.unit} color={getResourceColor(res.percent)} />
              ))}
            </div>
          </DashboardWidgetContainer>
          <DashboardWidgetContainer title="Health Factors" subtitle="Score contributors" className="lg:col-span-1">
            <div className="space-y-3">
              {data.health.factors.map((factor) => (
                <div key={factor.name} className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--color-text))]">{factor.label}</span>
                  <span className={cn('text-sm font-medium', factor.impact > 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
                    {factor.impact > 0 ? '+' : ''}{factor.impact}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-[hsl(var(--color-border))]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[hsl(var(--color-text))]">Total Score</span>
                  <span className={cn('text-lg font-bold', data.health.score >= 80 ? 'text-[hsl(var(--color-success))]' : data.health.score >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]')}>
                    {data.health.score}
                  </span>
                </div>
              </div>
            </div>
          </DashboardWidgetContainer>
          <SystemStatusPanel server={data.server} isOnline className="lg:col-span-1" />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection title="Activity" subtitle="Recent events and actions">
        <DashboardGrid cols={1} colsLg={3} gap="gap-6">
          <DashboardWidgetContainer title="Recent Activity" subtitle="Latest system events">
            <RecentActivityPanel activities={data.recentActivity.slice(0, 6)} />
          </DashboardWidgetContainer>
          <DashboardWidgetContainer title="Active Alerts" subtitle={`${String(data.activeAlerts.length)} active`}>
            <RecentAlertsPanel alerts={data.activeAlerts} />
          </DashboardWidgetContainer>
          <DashboardWidgetContainer title="Quick Actions" subtitle="Common tasks">
            <QuickActions actions={data.quickActions} />
          </DashboardWidgetContainer>
        </DashboardGrid>
      </DashboardSection>
    </PageContainer>
  );
}
