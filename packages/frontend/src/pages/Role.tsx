import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid, DashboardSection } from '../components/widgets/DashboardGrid.js';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import {
  RoleOverview, RoleCard, PermissionMatrix,
  RoleSearch,
} from '../components/widgets/role.js';
import { useRoles } from '../hooks/useRole.js';
import { SkeletonBlock } from '../components/shared/Skeleton.js';
import { ErrorState } from '../components/shared/Skeleton.js';

export function RolePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useRoles();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

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
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Roles & Permissions</h1>
        </div>
        <ErrorState title="Failed to load roles" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
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
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Roles & Permissions</h1>
        </div>
        <p className="text-sm text-[hsl(var(--color-muted))]">No role data available.</p>
      </PageContainer>
    );
  }

  const filteredRoles = useMemo(() => {
    if (!search) return data.roles;
    const q = search.toLowerCase();
    return data.roles.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [data.roles, search]);

  const selectedRoleData = selectedRole ? data.roles.find((r) => r.id === selectedRole) : null;

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Roles & Permissions</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Manage access control and permissions</p>
        </div>
        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
      </div>

      <RoleOverview roles={data.roles} />

      <div className="mt-6">
        <RoleSearch value={search} onChange={setSearch} />
      </div>

      <DashboardGrid cols={1} colsSm={2} colsMd={3} colsLg={5} gap="gap-4" className="mt-4">
        {filteredRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onClick={() => { setSelectedRole(selectedRole === role.id ? null : role.id); }}
            className={'cursor-pointer' + (selectedRole === role.id ? ' ring-2 ring-[hsl(var(--color-primary))]' : '')}
          />
        ))}
      </DashboardGrid>

      {selectedRoleData && (
        <DashboardSection title={`${selectedRoleData.name} Permissions`} subtitle="Detailed permission breakdown" className="mt-6">
          <div className="space-y-4">
            {data.resources.map((resource) => {
              const perms = selectedRoleData.permissions[resource.id] ?? [];
              return (
                <div key={resource.id} className="rounded-lg border border-[hsl(var(--color-border))] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-[hsl(var(--color-text))]">{resource.label}</h4>
                    <div className="flex gap-1">
                      {resource.actions.map((action) => (
                        <span key={action.id} className={'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ' + (perms.includes(action.id)
                            ? 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]'
                            : 'bg-[hsl(var(--color-border))] text-[hsl(var(--color-muted))]')}>
                          {perms.includes(action.id) ? '✓' : '—'} {action.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardSection>
      )}

      <DashboardSection title="Permission Matrix" subtitle="Cross-role permission comparison" className="mt-6">
        <PermissionMatrix roles={data.roles} resources={data.resources} />
      </DashboardSection>
    </PageContainer>
  );
}
