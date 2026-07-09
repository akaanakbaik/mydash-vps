import { cn } from '../../utils/cn.js';
import { Shield, Users, Search, Check, X } from 'lucide-react';

const roleBadgeColors: Record<string, string> = {
  Owner: 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]',
  Administrator: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  Operator: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
  'Read Only': 'bg-[hsl(var(--color-muted))]/10 text-[hsl(var(--color-muted))]',
  DevOps: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
};

export function RoleBadge({ label, className }: { label: string; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', roleBadgeColors[label] ?? '', className)}>{label}</span>;
}

export function RoleCard({ role, onClick, className }: { role: { id: string; name: string; description: string; usersCount: number; isSystem: boolean }; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={cn('w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 text-left transition-all hover:border-[hsl(var(--color-border))]/80 hover:bg-[hsl(var(--color-border))]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]', className)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[hsl(var(--color-primary))]" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-[hsl(var(--color-text))]">{role.name}</h4>
        </div>
        {role.isSystem && <span className="rounded bg-[hsl(var(--color-border))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--color-muted))]">System</span>}
      </div>
      <p className="text-xs text-[hsl(var(--color-muted))] mb-2">{role.description}</p>
      <div className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <span className="text-xs text-[hsl(var(--color-muted))]">{String(role.usersCount)} users</span>
      </div>
    </button>
  );
}

export function RoleOverview({ roles }: { roles: { name: string; usersCount: number }[]; className?: string }) {
  return (
    <div className="flex flex-wrap gap-4">
      {roles.map((r) => (
        <div key={r.name} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-28">
          <RoleBadge label={r.name} />
          <div>
            <p className="text-xs text-[hsl(var(--color-muted))]">Users</p>
            <p className="text-sm font-semibold text-[hsl(var(--color-text))]">{String(r.usersCount)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PermissionMatrix({ roles, resources }: {
  roles: { id: string; name: string; permissions: Record<string, string[]> }[];
  resources: { id: string; label: string; actions: { id: string; label: string }[] }[];
  className?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[hsl(var(--color-border))]">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[hsl(var(--color-border))]">
            <th className="sticky left-0 z-10 bg-[hsl(var(--color-surface))] p-2.5 text-left text-xs font-medium text-[hsl(var(--color-muted))] min-w-28">Resource</th>
            <th className="p-2.5 text-left text-xs font-medium text-[hsl(var(--color-muted))]">Action</th>
            {roles.map((r) => (
              <th key={r.id} className="p-2.5 text-center text-xs font-medium text-[hsl(var(--color-muted))] min-w-24">
                <RoleBadge label={r.name} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--color-border))]">
          {resources.map((resource) => {
              return (
                <tr key={resource.id} className="group">
                <td className="sticky left-0 z-10 bg-[hsl(var(--color-surface))] p-2.5 text-xs font-medium text-[hsl(var(--color-text))] group-hover:bg-[hsl(var(--color-bg))]">
                  {resource.label}
                </td>
                <td className="p-2.5 text-xs text-[hsl(var(--color-muted))]">
                  {resource.actions.map((a) => a.label).join(', ')}
                </td>
                {roles.map((r) => {
                  const perms = r.permissions[resource.id] ?? [];
                  const hasAll = resource.actions.every((a) => perms.includes(a.id));
                  const hasSome = resource.actions.some((a) => perms.includes(a.id));
                  return (
                    <td key={r.id} className="p-2.5 text-center">
                      {hasAll ? (
                        <Check className="mx-auto h-4 w-4 text-[hsl(var(--color-success))]" aria-label="Full access" />
                      ) : hasSome ? (
                        <span className="inline-flex items-center justify-center rounded bg-[hsl(var(--color-warning))]/20 px-1.5 py-0.5 text-[10px] text-[hsl(var(--color-warning))]">Partial</span>
                      ) : (
                        <X className="mx-auto h-4 w-4 text-[hsl(var(--color-muted))]" aria-label="No access" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PermissionBadge({ label, variant = 'info', className }: { label: string; variant?: string; className?: string }) {
  const colors: Record<string, string> = {
    info: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
    success: 'bg-[hsl(var(--color-success))]/10 text-[hsl(var(--color-success))]',
    warning: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
    danger: 'bg-[hsl(var(--color-danger))]/10 text-[hsl(var(--color-danger))]',
  };
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', colors[variant] ?? '', className)}>{label}</span>;
}

export function RoleSearch({ value, onChange, placeholder = 'Search roles...', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      <input type="text" value={value} onChange={(e) => { onChange(e.target.value); }} placeholder={placeholder}
        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] transition-colors focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
        aria-label={placeholder} />
    </div>
  );
}

export function RoleFilter({ options, selected, onChange, className }: { options: { id: string; label: string }[]; selected: string; onChange: (id: string) => void; className?: string }) {
  if (options.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt) => (
        <button key={opt.id} type="button" onClick={() => { onChange(opt.id); }}
          className={cn('rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]',
            selected === opt.id ? 'bg-[hsl(var(--color-primary))] text-white' : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]'
          )}
          aria-pressed={selected === opt.id} aria-label={'Filter by ' + opt.label}>{opt.label}</button>
      ))}
    </div>
  );
}

export function RoleStatus({ status, className }: { status: 'active' | 'inactive'; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', status === 'active' ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-muted))]', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'active' ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
