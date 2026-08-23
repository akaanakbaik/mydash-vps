import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardWidgetContainer, SummaryCard, TimeRangeSelector } from '../components/widgets/DashboardWidgetContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { StatusBanner } from '../components/widgets/StatusBanner.js';
import { RecentActivityPanel } from '../components/widgets/RecentActivityPanel.js';
import { RecentAlertsPanel } from '../components/widgets/RecentAlertsPanel.js';
import { QuickActions } from '../components/widgets/QuickActions.js';
import { SystemStatusPanel } from '../components/widgets/SystemStatusPanel.js';
import { RealtimeChart } from '../components/shared/RealtimeChart.js';
import { DistroBadge } from '../components/shared/DistroBadge.js';
import { Server, HeartPulse, Bell, Bot, Cpu, RefreshCw, HardDrive, MemoryStick, Network, Boxes, TimerReset } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { useDashboard } from '../hooks/useOverview.js';
import { useMonitoringTimeline } from '../hooks/useMonitoring.js';
import { SkeletonBlock, Skeleton } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';

function finite(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function formatBytes(mb: number | undefined): string {
  if (typeof mb !== 'number' || !Number.isFinite(mb)) return 'Not available';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${String(Math.round(mb))} MB`;
}

function safeText(value: string | undefined, fallback = 'Not available'): string {
  return value && value.trim() ? value : fallback;
}

function ResourceBar({ used, total, label, unit, color = 'primary' }: {
  used: number; total: number; label: string; unit: string; color?: string;
}) {
  const safeUsed = finite(used);
  const safeTotal = finite(total);
  const hasCapacity = safeTotal > 0;
  const percent = hasCapacity ? Math.min(Math.max((safeUsed / safeTotal) * 100, 0), 100) : unit === '%' ? Math.min(Math.max(safeUsed, 0), 100) : 0;
  const colorClass = color === 'danger'
    ? 'bg-[hsl(var(--color-danger))]'
    : color === 'warning'
      ? 'bg-[hsl(var(--color-warning))]'
      : 'bg-[hsl(var(--color-primary))]';
  const valueLabel = unit === '%' ? `${safeUsed.toFixed(1)}%` : hasCapacity ? `${formatBytes(safeUsed)} / ${formatBytes(safeTotal)}` : 'Not available';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[hsl(var(--color-text))]">{label}</span>
        <span className="text-[hsl(var(--color-muted))]">{valueLabel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--color-border))]">
        <div className={cn('h-full rounded-full transition-[width] duration-500', colorClass)} style={{ width: `${String(percent)}%` }} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${String(Math.round(percent))}%`} />
      </div>
    </div>
  );
}

function SpecRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[hsl(var(--color-surface-raised)/0.55)]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--color-bg))] text-[hsl(var(--color-primary))]">{icon}</span>
      <span className="min-w-0 flex-1 text-xs text-[hsl(var(--color-muted))]">{label}</span>
      <span className="max-w-[58%] truncate text-right text-xs font-semibold text-[hsl(var(--color-text))]">{value}</span>
    </div>
  );
}

export function OverviewPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('24h');
  const [historyVisible, setHistoryVisible] = useState(true);
  const { data, isLoading, isError, isFetching, refetch } = useDashboard();
  const timelineQuery = useMonitoringTimeline('all', timeRange);
  if (isLoading) {
    return <PageContainer maxWidth="xl"><SkeletonBlock lines={3} /><Skeleton className="mt-6 h-48 w-full" /></PageContainer>;
  }
  if (isError) {
    return <PageContainer maxWidth="xl"><ErrorState title="Failed to load dashboard" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} /></PageContainer>;
  }
  if (!data) {
    return <PageContainer maxWidth="xl"><p className="text-sm text-[hsl(var(--color-muted))]">No dashboard data available.</p></PageContainer>;
  }
  const resources = data.resources ?? [];
  const cpuResource = resources.find((resource) => resource.label.toLowerCase() === 'cpu') ?? resources[0];
  const getResourceColor = (percent: number): string => percent >= 90 ? 'danger' : percent >= 70 ? 'warning' : 'primary';
  const timeline = (timelineQuery.data ?? []).filter((point) => [point.cpu, point.memory, point.disk, point.network].every((value) => Number.isFinite(value)));
  const timelineSeries = [
    { label: 'CPU', color: '#fb923c', data: timeline.map((point) => ({ timestamp: point.timestamp, value: point.cpu })), fill: true },
    { label: 'Memory', color: '#60a5fa', data: timeline.map((point) => ({ timestamp: point.timestamp, value: point.memory })), fill: true },
    { label: 'Disk', color: '#f87171', data: timeline.map((point) => ({ timestamp: point.timestamp, value: point.disk })), dashed: true },
  ];
  const refreshAll = () => {
    void refetch();
    void timelineQuery.refetch();
  };
  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <DistroBadge distro={data.server.distro ?? data.server.os} kernel={data.server.kernel} className="max-w-full" />
          {isFetching && <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { setHistoryVisible((value) => !value); }} className="skeuo-raised inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[hsl(var(--color-text))] transition-transform active:scale-[.97]" aria-pressed={historyVisible}><TimerReset className="h-4 w-4" />{historyVisible ? 'Hide history' : 'Show history'}</button>
          <button type="button" onClick={refreshAll} className="skeuo-raised inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[hsl(var(--color-text))] transition-transform active:scale-[.97]" disabled={isFetching || timelineQuery.isFetching}><RefreshCw className={cn('h-4 w-4', (isFetching || timelineQuery.isFetching) && 'animate-spin')} />Refresh</button>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
      </div>
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Overview</h1>
        <p className="text-sm text-[hsl(var(--color-muted))]">{data.server.hostname} · {safeText(data.server.distro ?? data.server.os)} · {safeText(data.server.interfaceIpv4)}</p>
      </div>
      {data.health.score < 70 && <StatusBanner variant="error" title="System health is degraded" description={`Health score is ${String(data.health.score)}/100. Check active alerts for details.`} className="mb-6" />}
      {data.health.score >= 70 && data.health.score < 85 && <StatusBanner variant="warning" title="System health needs attention" description={`Health score is ${String(data.health.score)}/100. Some factors require review.`} className="mb-6" />}
      {data.health.score >= 85 && <StatusBanner variant="success" title="All systems operational" description={`Health score is ${String(data.health.score)}/100. Server is running normally.`} className="mb-6" />}
      <DashboardSection title="Summary" subtitle="System overview at a glance" className="mb-6">
        <DashboardGrid cols={1} colsSm={2} colsLg={3} colsXl={5} gap="gap-2 sm:gap-3">
          <SummaryCard label="Server Status" value={data.server.hostname} subtitle={`Up ${data.server.uptime}`} icon={<Server className="h-5 w-5" />} color="primary" onClick={() => { void navigate('/monitoring'); }} />
          <SummaryCard label="Health Score" value={finite(data.health.score)} subtitle={`Grade ${data.health.grade} · ${data.health.trend === 'up' ? 'Improving' : data.health.trend === 'down' ? 'Declining' : 'Stable'}`} icon={<HeartPulse className="h-5 w-5" />} color={data.health.score >= 80 ? 'success' : data.health.score >= 60 ? 'warning' : 'danger'} trend={data.health.trend} onClick={() => { void navigate('/health-score'); }} />
          <SummaryCard label="CPU Load" value={`${finite(cpuResource?.used).toFixed(1)}%`} subtitle={`${String(data.server.cpuCores)} cores`} icon={<Cpu className="h-5 w-5" />} color={finite(cpuResource?.used) > 80 ? 'danger' : finite(cpuResource?.used) > 60 ? 'warning' : 'success'} onClick={() => { void navigate('/monitoring'); }} />
          <SummaryCard label="Notifications" value={data.notificationSummary.unread.toString()} subtitle={`${String(data.notificationSummary.failed)} failed`} icon={<Bell className="h-5 w-5" />} color={data.notificationSummary.failed > 0 ? 'warning' : 'info'} onClick={() => { void navigate('/notifications'); }} />
          <SummaryCard label="Automations" value={data.automationSummary.active.toString()} subtitle={`${String(data.automationSummary.running)} running`} icon={<Bot className="h-5 w-5" />} color="primary" onClick={() => { void navigate('/automation'); }} />
        </DashboardGrid>
      </DashboardSection>
      <DashboardSection title="Host specification" subtitle="Short, practical facts collected from the VPS" className="mb-6">
        <DashboardGrid cols={1} colsLg={2} gap="gap-4 sm:gap-6">
          <DashboardWidgetContainer title="System identity" subtitle="Detected from the host metrics agent">
            <div className="grid gap-1 sm:grid-cols-2">
              <SpecRow icon={<Server className="h-4 w-4" />} label="Hostname" value={safeText(data.server.hostname)} />
              <SpecRow icon={<HardDrive className="h-4 w-4" />} label="Filesystem" value={safeText(data.server.filesystem)} />
              <SpecRow icon={<Cpu className="h-4 w-4" />} label="CPU" value={`${safeText(data.server.cpuModel)} · ${String(data.server.cpuCores)} cores`} />
              <SpecRow icon={<Boxes className="h-4 w-4" />} label="Virtualization" value={safeText(data.server.virtualization)} />
              <SpecRow icon={<Network className="h-4 w-4" />} label="Interface" value={`${safeText(data.server.interface)} · ${safeText(data.server.interfaceIpv4)}`} />
              <SpecRow icon={<TimerReset className="h-4 w-4" />} label="Collector" value={safeText(data.server.agentVersion)} />
            </div>
          </DashboardWidgetContainer>
          <DashboardWidgetContainer title="Capacity" subtitle="Current host capacity and allocation">
            <div className="grid gap-1 sm:grid-cols-2">
              <SpecRow icon={<MemoryStick className="h-4 w-4" />} label="Memory" value={`${formatBytes(data.server.usedRam)} / ${formatBytes(data.server.totalRam)}`} />
              <SpecRow icon={<MemoryStick className="h-4 w-4" />} label="Swap" value={`${formatBytes(data.server.usedSwap)} / ${formatBytes(data.server.totalSwap)}`} />
              <SpecRow icon={<HardDrive className="h-4 w-4" />} label="Root disk" value={`${formatBytes(data.server.usedDisk)} / ${formatBytes(data.server.totalDisk)}`} />
              <SpecRow icon={<TimerReset className="h-4 w-4" />} label="Uptime" value={safeText(data.server.uptime)} />
            </div>
          </DashboardWidgetContainer>
        </DashboardGrid>
      </DashboardSection>
      <DashboardSection title="System" subtitle="Resource usage and health" className="mb-6">
        <DashboardGrid cols={1} colsLg={3} gap="gap-4 sm:gap-6">
          <DashboardWidgetContainer title="Resource Usage" subtitle="Current host metrics" className="lg:col-span-1">
            <div className="space-y-4">
              {resources.map((resource) => <ResourceBar key={resource.label} label={resource.label} used={resource.used} total={resource.total} unit={resource.unit} color={getResourceColor(resource.percent)} />)}
            </div>
          </DashboardWidgetContainer>
          <DashboardWidgetContainer title="Health Factors" subtitle="Score contributors" className="lg:col-span-1">
            <div className="space-y-3">
              {data.health.factors.length === 0 && <p className="text-sm text-[hsl(var(--color-muted))]">No health factors available.</p>}
              {data.health.factors.map((factor) => <div key={factor.name} className="flex items-center justify-between"><span className="text-sm text-[hsl(var(--color-text))]">{factor.label}</span><span className={cn('text-sm font-medium', factor.impact > 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>{factor.impact > 0 ? '+' : ''}{factor.impact}</span></div>)}
              <div className="border-t border-[hsl(var(--color-border))] pt-2"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[hsl(var(--color-text))]">Total Score</span><span className={cn('text-lg font-bold', data.health.score >= 80 ? 'text-[hsl(var(--color-success))]' : data.health.score >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-danger))]')}>{finite(data.health.score).toFixed(2)}</span></div></div>
            </div>
          </DashboardWidgetContainer>
          <SystemStatusPanel server={data.server} isOnline className="lg:col-span-1" />
        </DashboardGrid>
      </DashboardSection>
      {historyVisible && <DashboardSection title="Live history" subtitle={`Database timeline · ${timeRange}`} className="mb-6"><DashboardWidgetContainer title="Resource trend" subtitle={timelineQuery.isFetching ? 'Updating from VPS...' : `${String(timeline.length)} real samples`}><RealtimeChart series={timelineSeries} height={250} yLabel="Percent" showGrid showAxis animate /></DashboardWidgetContainer></DashboardSection>}
      <DashboardSection title="Activity" subtitle="Recent events and actions">
        <DashboardGrid cols={1} colsLg={3} gap="gap-4 sm:gap-6">
          <DashboardWidgetContainer title="Recent Activity" subtitle="Latest system events"><RecentActivityPanel activities={data.recentActivity.slice(0, 6)} /></DashboardWidgetContainer>
          <DashboardWidgetContainer title="Active Alerts" subtitle={`${String(data.activeAlerts.length)} active`}><RecentAlertsPanel alerts={data.activeAlerts} /></DashboardWidgetContainer>
          <DashboardWidgetContainer title="Quick Actions" subtitle="Common tasks"><QuickActions actions={data.quickActions} /></DashboardWidgetContainer>
        </DashboardGrid>
      </DashboardSection>
    </PageContainer>
  );
}
