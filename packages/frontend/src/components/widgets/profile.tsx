import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { User, Mail, Phone, MapPin, Calendar, Shield, Key, Laptop, Smartphone, Monitor, Server, Activity } from 'lucide-react';
import { SkeletonBlock } from '../shared/Skeleton.js';
export function ProfileCard({ title, icon, children, className }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]', className)} aria-label={title}>
      <div className="flex items-center gap-2 border-b border-[hsl(var(--color-border))] px-4 py-3">
        <span className="text-[hsl(var(--color-muted))]" aria-hidden="true">{icon}</span>
        <h3 className="text-sm font-semibold text-[hsl(var(--color-text))]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
export function ProfileOverview({ profile }: { profile: { username: string; fullName: string; email: string; role: string; avatarUrl: string; location: string; joinDate: string; lastActive: string }; className?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-primary))]/20 text-xl font-bold text-[hsl(var(--color-primary))]">
        {profile.fullName.charAt(0).toUpperCase()}
      </div>
      <div className="text-center sm:text-left">
        <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">{profile.fullName}</h2>
        <p className="text-sm text-[hsl(var(--color-muted))]">@{profile.username}</p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="rounded-full bg-[hsl(var(--color-primary))]/10 px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--color-primary))]">{profile.role}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">{profile.location}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
export function AvatarCard({ profile, isLoading }: { profile: { username: string; fullName: string; email: string; role: string }; isLoading?: boolean }) {
  if (isLoading) return <ProfileCard title="Avatar" icon={<User className="h-4 w-4" />}><SkeletonBlock lines={3} /></ProfileCard>;
  return (
    <ProfileCard title="Profile" icon={<User className="h-4 w-4" />}>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-primary))]/20 text-lg font-bold text-[hsl(var(--color-primary))]">
          {profile.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-[hsl(var(--color-text))]">{profile.fullName}</p>
          <p className="text-xs text-[hsl(var(--color-muted))]">@{profile.username}</p>
          <p className="text-xs text-[hsl(var(--color-muted))]">{profile.email}</p>
        </div>
      </div>
    </ProfileCard>
  );
}
export function ProfileInformation({ profile, isLoading }: { profile: { fullName: string; email: string; phoneNumber: string; location: string; department: string; bio: string }; isLoading?: boolean }) {
  if (isLoading) return <ProfileCard title="Profile Information" icon={<User className="h-4 w-4" />}><SkeletonBlock lines={5} /></ProfileCard>;
  const fields = [
    { label: 'Full Name', value: profile.fullName, icon: User },
    { label: 'Email', value: profile.email, icon: Mail },
    { label: 'Phone', value: profile.phoneNumber, icon: Phone },
    { label: 'Location', value: profile.location, icon: MapPin },
    { label: 'Department', value: profile.department, icon: Calendar },
  ];
  return (
    <ProfileCard title="Profile Information" icon={<User className="h-4 w-4" />}>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <f.icon className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-xs text-[hsl(var(--color-muted))]">{f.label}</p>
              <p className="text-sm text-[hsl(var(--color-text))]">{f.value}</p>
            </div>
          </div>
        ))}
        <div className="pt-2">
          <p className="text-xs text-[hsl(var(--color-muted))]">Bio</p>
          <p className="text-sm text-[hsl(var(--color-text))]">{profile.bio}</p>
        </div>
      </div>
    </ProfileCard>
  );
}
export function SecurityInformation({ security, isLoading }: { security: { passwordLastChanged: string; mfaMethod: string; trustedDevices: number; activeSessions: number }; isLoading?: boolean }) {
  if (isLoading) return <ProfileCard title="Security" icon={<Shield className="h-4 w-4" />}><SkeletonBlock lines={4} /></ProfileCard>;
  return (
    <ProfileCard title="Security" icon={<Shield className="h-4 w-4" />}>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Password Last Changed</span><span className="text-[hsl(var(--color-text))]">{new Date(security.passwordLastChanged).toLocaleDateString()}</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">MFA Method</span><span className="text-[hsl(var(--color-text))]">{security.mfaMethod === 'app' ? 'Authenticator App' : security.mfaMethod === 'sms' ? 'SMS' : 'None'}</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Trusted Devices</span><span className="text-[hsl(var(--color-text))]">{String(security.trustedDevices)}</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Active Sessions</span><span className="text-[hsl(var(--color-text))]">{String(security.activeSessions)}</span></div>
      </div>
    </ProfileCard>
  );
}
export function DeviceInformation({ devices, isLoading }: { devices: { id: string; name: string; type: string; os: string; browser: string; lastActive: string; isCurrent: boolean }[]; isLoading?: boolean }) {
  if (isLoading) return <ProfileCard title="Devices" icon={<Monitor className="h-4 w-4" />}><SkeletonBlock lines={3} /></ProfileCard>;
  return (
    <ProfileCard title="Devices" icon={<Monitor className="h-4 w-4" />}>
      <div className="space-y-2">
        {devices.map((d) => (
          <div key={d.id} className={cn('flex items-start gap-3 rounded-lg border border-[hsl(var(--color-border))] p-3', d.isCurrent && 'ring-1 ring-[hsl(var(--color-primary))]')}>
            <div className="mt-0.5">
              {d.type === 'laptop' && <Laptop className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />}
              {d.type === 'desktop' && <Monitor className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />}
              {d.type === 'mobile' && <Smartphone className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />}
              {d.type === 'server' && <Server className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-[hsl(var(--color-text))]">{d.name}</p>
                {d.isCurrent && <span className="rounded-full bg-[hsl(var(--color-primary))]/10 px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--color-primary))]">Current</span>}
              </div>
              <p className="text-[10px] text-[hsl(var(--color-muted))]">{d.os} &middot; {d.browser}</p>
            </div>
          </div>
        ))}
      </div>
    </ProfileCard>
  );
}
export function ActivityInformation({ activity, isLoading }: { activity: { id: string; action: string; timestamp: string; ip: string; location: string }[]; isLoading?: boolean }) {
  if (isLoading) return <ProfileCard title="Recent Activity" icon={<Activity className="h-4 w-4" />}><SkeletonBlock lines={4} /></ProfileCard>;
  return (
    <ProfileCard title="Recent Activity" icon={<Activity className="h-4 w-4" />}>
      <div className="space-y-1.5">
        {activity.map((a) => (
          <div key={a.id} className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-[hsl(var(--color-bg))]/50">
            <Activity className="mt-0.5 h-3.5 w-3.5 text-[hsl(var(--color-muted))]" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--color-text))]">{a.action}</p>
              <p className="text-[10px] text-[hsl(var(--color-muted))]">{a.location} &middot; {a.ip}</p>
            </div>
          </div>
        ))}
      </div>
    </ProfileCard>
  );
}
export function AccountInformation({ account, isLoading }: { account: { storageUsed: number; storageLimit: number; projectsCount: number; apiCalls: number; apiLimit: number }; isLoading?: boolean }) {
  if (isLoading) return <ProfileCard title="Account" icon={<Key className="h-4 w-4" />}><SkeletonBlock lines={4} /></ProfileCard>;
  return (
    <ProfileCard title="Account" icon={<Key className="h-4 w-4" />}>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Storage Used</span><span className="text-[hsl(var(--color-text))]">{(account.storageUsed / 1024).toFixed(1)} GB / {(account.storageLimit / 1024).toFixed(1)} GB</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">Projects</span><span className="text-[hsl(var(--color-text))]">{String(account.projectsCount)}</span></div>
        <div className="flex justify-between"><span className="text-[hsl(var(--color-muted))]">API Calls</span><span className="text-[hsl(var(--color-text))]">{String(account.apiCalls)} / {String(account.apiLimit)}</span></div>
      </div>
    </ProfileCard>
  );
}
const badgeColors: Record<string, string> = {
  Owner: 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]',
  Administrator: 'bg-[hsl(var(--color-warning))]/10 text-[hsl(var(--color-warning))]',
  Operator: 'bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))]',
  'Read Only': 'bg-[hsl(var(--color-muted))]/10 text-[hsl(var(--color-muted))]',
};
export function ProfileBadge({ label, className }: { label: string; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[label] ?? '', className)}>{label}</span>;
}
export function ProfileStatus({ status, className }: { status: 'online' | 'offline' | 'away'; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'online' ? 'bg-[hsl(var(--color-success))]' : status === 'away' ? 'bg-[hsl(var(--color-warning))]' : 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
