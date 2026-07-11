import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardSection } from '../components/widgets/DashboardGrid.js';
import {
  GitHubOverview, WorkflowHistory, BranchCard,
  GitHubSearch, GitHubFilter, GitHubEmptyState,
} from '../components/widgets/github.js';
import { RepositoryTable } from '../components/widgets/RepositoryTable.js';
import type { RecordUnknown } from '../components/widgets/types.js';
import { useGitHub } from '../hooks/useGitHub.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';
const gitHubFilterOptions = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
];
export function GitHubPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useGitHub();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  if (isLoading) {
    return <PageContainer><div className="mb-6"><SkeletonBlock lines={2} /></div><SkeletonBlock lines={8} /></PageContainer>;
  }
  if (isError) {
    return <PageContainer>
      <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
      <ErrorState title="Failed to load GitHub data" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
    </PageContainer>;
  }
  if (!data) {
    return <PageContainer>
      <button onClick={() => void navigate('/')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
      <GitHubEmptyState />
    </PageContainer>;
  }
  const filteredRepos = useMemo(() => {
    let items = data.repos;
    if (filter === 'private') items = items.filter((r) => r.private);
    if (filter === 'public') items = items.filter((r) => !r.private);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(q) || r.language.toLowerCase().includes(q));
    }
    return items;
  }, [data.repos, filter, search]);
  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">GitHub</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Manage repositories, workflows, and integrations</p>
        </div>
        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
      </div>
      <GitHubOverview repos={data.repos.length} workflows={data.workflows.length} connected={data.connected} />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WorkflowHistory workflows={data.workflows} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.branches.slice(0, 3).map((b) => (<BranchCard key={b.name} branch={b} />))}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64"><GitHubSearch value={search} onChange={setSearch} /></div>
        <GitHubFilter options={gitHubFilterOptions} selected={filter} onChange={setFilter} />
      </div>
      <DashboardSection title="Repositories" subtitle="All GitHub repositories">          {filteredRepos.length === 0 ? <GitHubEmptyState /> : <RepositoryTable data={filteredRepos as unknown as RecordUnknown[]} />}
      </DashboardSection>
    </PageContainer>
  );
}
