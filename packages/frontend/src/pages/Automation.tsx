import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { DashboardWidgetContainer } from '../components/widgets/DashboardWidgetContainer.js';
import {
  AutomationOverview, AutomationSummaryCard, WorkflowCard,
  WorkflowStatusCard, TriggerCard, ConditionCard, ActionCard,
  ExecutionQueueCard, RetryPolicyCard, RollbackCard, SchedulerCard,
  ExecutionTimeline, AutomationActivity, AutomationFilter, AutomationSearch,
} from '../components/widgets/automation.js';
import { ExecutionHistoryTable } from '../components/widgets/ExecutionHistoryTable.js';
import { useAutomation } from '../hooks/useAutomation.js';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';

export function AutomationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useAutomation();

  if (isLoading) {
    return <PageContainer maxWidth="xl"><SkeletonBlock lines={3} /><SkeletonBlock lines={10} /></PageContainer>;
  }
  if (isError) {
    return <PageContainer maxWidth="xl">
      <button type="button" onClick={() => void navigate('/')} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
      <ErrorState title="Failed to load automation data" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
    </PageContainer>;
  }
  if (!data) {
    return <PageContainer maxWidth="xl"><p className="text-sm text-[hsl(var(--color-muted))]">No automation data available.</p></PageContainer>;
  }

  const filteredWorkflows = useMemo(() => {
    let rows = data.workflows;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') rows = rows.filter((w) => w.status === statusFilter);
    return rows;
  }, [data.workflows, searchQuery, statusFilter]);

  const filteredExecutions = useMemo(() => {
    let rows = data.executions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((e) => e.workflowName.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') rows = rows.filter((e) => e.status === statusFilter);
    return rows;
  }, [data.executions, searchQuery, statusFilter]);

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void navigate('/')}
            className="rounded-lg p-1.5 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label="Back to overview"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[hsl(var(--color-text))]">Automation</h1>
            <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">Workflow automation and execution management</p>
          </div>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
        </div>
      </div>

      <AutomationOverview summary={data.summary} className="mb-6" />

      <DashboardGrid cols={1} colsMd={2} colsLg={4} gap="gap-4" className="mb-6">
        <AutomationSummaryCard summary={data.summary} />
        <ExecutionQueueCard queue={data.queue} />
        <SchedulerCard scheduler={data.scheduler} />
        <WorkflowStatusCard workflows={data.workflows} />
      </DashboardGrid>

      <DashboardGrid cols={1} colsLg={2} gap="gap-4" className="mb-6">
        <TriggerCard triggers={data.triggers} />
        <ActionCard actions={data.actions} />
      </DashboardGrid>

      <DashboardGrid cols={1} colsMd={2} colsLg={4} gap="gap-4" className="mb-6">
        <RetryPolicyCard retry={data.retry} />
        <RollbackCard rollback={data.rollback} />
        <div className="lg:col-span-2"><ConditionCard /></div>
      </DashboardGrid>

      <DashboardSection title="Workflows" subtitle={`${String(filteredWorkflows.length)} workflows`} className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <AutomationFilter options={data.filterCategories} selected={statusFilter} onChange={setStatusFilter} />
          <AutomationSearch value={searchQuery} onChange={setSearchQuery} className="sm:w-64" />
        </div>
        <DashboardGrid cols={1} colsMd={2} colsLg={3} gap="gap-4">
          {filteredWorkflows.map((w) => (<WorkflowCard key={w.id} workflow={w} />))}
        </DashboardGrid>
      </DashboardSection>

      <DashboardGrid cols={1} colsLg={2} gap="gap-4" className="mb-6">
        <DashboardWidgetContainer title="Execution Timeline" subtitle="24-hour activity">
          <ExecutionTimeline data={data.timeline} label="Executions Over Time" />
        </DashboardWidgetContainer>
        <DashboardWidgetContainer title="Recent Activity" subtitle="Latest automation events">
          <AutomationActivity activity={data.activity} />
        </DashboardWidgetContainer>
      </DashboardGrid>

      <DashboardSection title="Execution History" subtitle={`${String(filteredExecutions.length)} records`}>
        <DashboardWidgetContainer title="Executions" subtitle={`${String(filteredExecutions.length)} runs`}>
          <ExecutionHistoryTable data={filteredExecutions} />
        </DashboardWidgetContainer>
      </DashboardSection>
    </PageContainer>
  );
}
