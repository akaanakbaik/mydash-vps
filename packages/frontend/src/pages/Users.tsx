import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardSection } from '../components/widgets/DashboardGrid.js';
import { ArrowLeft, RefreshCw, Shield, Search, User, MoreHorizontal, Plus, X } from 'lucide-react';
import { SkeletonBlock, ErrorState } from '../components/shared/Skeleton.js';
import { cn } from '../utils/cn.js';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
interface UserData {
  id: string; username: string; email: string; displayName: string;
  role: string; shell: string; status: string; createdAt: string;
}
interface UsersResponse {
  users: UserData[]; total: number;
}
const roleColors: Record<string, string> = {
  owner: 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]',
  admin: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  general: 'bg-[hsl(var(--color-muted))]/10 text-[hsl(var(--color-muted))]',
};
export function UsersPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useQuery<UsersResponse>({
    queryKey: ['users', 'list'],
    queryFn: () => apiClient.get<UsersResponse>('/users').then((r) => r.data),
    staleTime: 30000,
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', displayName: '', role: 'general' });
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const users = data?.users ?? [];
  const filteredUsers = useMemo(() => {
    let items = users;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') {
      items = items.filter((u) => u.role === roleFilter);
    }
    return items;
  }, [users, search, roleFilter]);
  const ownerCount = users.filter((u) => u.role === 'owner').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const generalCount = users.filter((u) => u.role === 'general').length;
  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6"><SkeletonBlock lines={2} /></div>
        <SkeletonBlock lines={10} />
      </PageContainer>
    );
  }
  if (isError) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => void navigate('/')} className="rounded-lg p-1.5 text-[hsl(var(--color-muted))]"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">User Management</h1>
        </div>
        <ErrorState title="Failed to load users" action={<button onClick={() => void refetch()} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => void navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))]"
          aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">User Management</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Manage users, roles, and permissions</p>
        </div>
        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" />}
        <button type="button" onClick={() => { setShowAddModal(true); setAddError(null); setNewUser({ username: '', email: '', password: '', displayName: '', role: 'general' }); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--color-primary))] px-3 py-2 text-xs font-medium text-white transition-colors hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Add User
        </button>
      </div>
      {}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-28">
          <User className="h-5 w-5 text-[hsl(var(--color-primary))]" />
          <div><p className="text-xs text-[hsl(var(--color-muted))]">Total Users</p><p className="text-sm font-semibold text-[hsl(var(--color-text))]">{String(users.length)}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-28">
          <Shield className="h-5 w-5 text-[hsl(var(--color-primary))]" />
          <div><p className="text-xs text-[hsl(var(--color-muted))]">Owners</p><p className="text-sm font-semibold text-[hsl(var(--color-text))]">{String(ownerCount)}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-28">
          <Shield className="h-5 w-5 text-[hsl(var(--color-warning))]" />
          <div><p className="text-xs text-[hsl(var(--color-muted))]">Admins</p><p className="text-sm font-semibold text-[hsl(var(--color-text))]">{String(adminCount)}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 py-3 flex-1 min-w-28">
          <User className="h-5 w-5 text-[hsl(var(--color-muted))]" />
          <div><p className="text-xs text-[hsl(var(--color-muted))]">General</p><p className="text-sm font-semibold text-[hsl(var(--color-text))]">{String(generalCount)}</p></div>
        </div>
      </div>
      {}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--color-muted))]" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }}
            placeholder="Search users..." aria-label="Search users"
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'owner', 'admin', 'general'].map((role) => (
            <button key={role} type="button" onClick={() => { setRoleFilter(role); }}
              className={cn('rounded-full px-3 py-1 text-xs font-medium transition-all',
                roleFilter === role ? 'bg-[hsl(var(--color-primary))] text-white' : 'bg-[hsl(var(--color-bg))] text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]'
              )}>
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {}
      <DashboardSection title={`Users (${String(filteredUsers.length)})`} subtitle="System user accounts">
        <div className="overflow-x-auto rounded-xl border border-[hsl(var(--color-border))]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]">
                <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">User</th>
                <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">Email</th>
                <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">Role</th>
                <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">Status</th>
                <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">Shell</th>
                <th className="p-3 text-left font-medium text-[hsl(var(--color-muted))]">Created</th>
                <th className="p-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--color-border))]">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-[hsl(var(--color-muted))]">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-[hsl(var(--color-border))]/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--color-primary))]/20 text-[10px] font-bold text-[hsl(var(--color-primary))]">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[hsl(var(--color-text))]">{user.displayName}</p>
                          <p className="text-[10px] text-[hsl(var(--color-muted))]">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[hsl(var(--color-text))]">{user.email}</td>
                    <td className="p-3">
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', roleColors[user.role] ?? '')}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', user.status === 'active' ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-muted))]')}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', user.status === 'active' ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-muted))]')} />
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-[hsl(var(--color-muted))] font-mono">{user.shell || '—'}</td>
                    <td className="p-3 text-sm text-[hsl(var(--color-muted))]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button className="rounded-lg p-1 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))]">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardSection>
      {}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { if (!adding) setShowAddModal(false); }}>
          <div className="w-full max-w-md rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">Add New User</h3>
              <button type="button" onClick={() => { if (!adding) setShowAddModal(false); }} className="rounded-lg p-1 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1">Username *</label>
                <input type="text" value={newUser.username} onChange={e => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1">Display Name</label>
                <input type="text" value={newUser.displayName} onChange={e => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1">Email *</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1">Password *</label>
                <input type="password" value={newUser.password} onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]">
                  <option value="general">General</option>
                  <option value="admin">Administrator</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
            {addError && <p className="mt-2 text-xs text-red-500">{addError}</p>}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowAddModal(false)} disabled={adding}
                className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] disabled:opacity-50">Cancel</button>
              <button type="button" onClick={async () => {
                if (!newUser.username || !newUser.email || !newUser.password) { setAddError('Username, email, and password are required'); return; }
                setAdding(true); setAddError(null);
                try {
                  const res = await fetch('/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: newUser.username, email: newUser.email, password: newUser.password, displayName: newUser.displayName || newUser.username, role: newUser.role }) });
                  const json = await res.json();
                  if (json.success) { setShowAddModal(false); void refetch(); } else { setAddError(json.error?.message || 'Registration failed'); }
                } catch { setAddError('Network error'); }
                setAdding(false);
              }} disabled={adding}
                className="rounded-lg bg-[hsl(var(--color-primary))] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50">
                {adding ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
