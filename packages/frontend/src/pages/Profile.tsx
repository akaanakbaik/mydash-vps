import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { DashboardGrid } from '../components/widgets/DashboardGrid.js';
import { ArrowLeft, RefreshCw, Check, X } from 'lucide-react';
import {
  ProfileOverview, AvatarCard, ProfileInformation,
  SecurityInformation, DeviceInformation, ActivityInformation, AccountInformation,
} from '../components/widgets/profile.js';
import { safeStr } from '../utils/index.js';
import { useProfile, useUpdateProfile } from '../hooks/useProfile.js';
import { SkeletonBlock, ErrorState } from '../components/shared/Skeleton.js';

export function ProfilePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleStartEdit = useCallback(() => {
    if (data) {
      setFormData({ fullName: data.fullName, email: data.email });
      setEditing(true);
      setSaveStatus(null);
    }
  }, [data]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setFormData({});
    setSaveStatus(null);
  }, []);

  const handleSave = useCallback(() => {
    updateProfile.mutate(formData, {
      onSuccess: () => {
        setEditing(false);
        setSaveStatus('saved');
        setTimeout(() => { setSaveStatus(null); }, 3000);
      },
      onError: () => {
        setSaveStatus('error');
        setTimeout(() => { setSaveStatus(null); }, 3000);
      },
    });
  }, [formData, updateProfile]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--color-border))]" />
          <div><SkeletonBlock lines={2} /></div>
        </div>
        <DashboardGrid cols={1} colsLg={2} gap="gap-6">
          <SkeletonBlock lines={6} />
          <SkeletonBlock lines={6} />
        </DashboardGrid>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button type="button" onClick={() => { void navigate('/'); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Profile</h1>
        </div>
        <ErrorState title="Failed to load profile" action={<button type="button" onClick={() => { void refetch(); }} className="mt-2 rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white">Retry</button>} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center gap-4">
          <button type="button" onClick={() => { void navigate('/'); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Profile</h1>
        </div>
        <p className="text-sm text-[hsl(var(--color-muted))]">No profile data available.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-4">
        <button type="button" onClick={() => { void navigate('/'); }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted)/0.8)] hover:text-[hsl(var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]"
          aria-label="Back to dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Profile</h1>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Manage your account and preferences</p>
        </div>
        {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-[hsl(var(--color-muted))]" aria-label="Refreshing" />}
      </div>

      <ProfileOverview profile={data} />

      {saveStatus === 'saved' && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          Profile updated successfully
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          Failed to update profile
        </div>
      )}

      <DashboardGrid cols={1} colsLg={2} gap="gap-6" className="mt-6">
        <div className="space-y-6">
          <AvatarCard profile={data} />
          <SecurityInformation security={data.securityInfo} />
          <AccountInformation account={data.accountInfo} />
        </div>
        <div className="space-y-6">
          <ProfileInformation profile={editing ? { ...data, ...formData } : data} />
          <DeviceInformation devices={data.devices} />
          <ActivityInformation activity={data.recentActivity} />

          {!editing ? (
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4">
              <button
                type="button"
                onClick={handleStartEdit}
                className="rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-xs font-medium text-white transition-colors hover:opacity-90"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1">Full Name</label>
                <input
                  type="text"
                  value={safeStr(formData.fullName)}
                  onChange={(e) => { handleFieldChange('fullName', e.target.value); }}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text))] mb-1">Email</label>
                <input
                  type="email"
                  value={safeStr(formData.email)}
                  onChange={(e) => { handleFieldChange('email', e.target.value); }}
                  className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-text))] placeholder:text-[hsl(var(--color-muted))] focus:border-[hsl(var(--color-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary))]"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--color-primary))] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {updateProfile.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={updateProfile.isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-muted))] transition-colors hover:text-[hsl(var(--color-text))] disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardGrid>
    </PageContainer>
  );
}
