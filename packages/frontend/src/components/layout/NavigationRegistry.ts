import {
  LayoutDashboard, Server, Activity, Cpu, Bell, Bot, HardDrive,
  Terminal, Package, GitBranch, Lock, FileText, Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  group: 'primary' | 'management' | 'system';
}

const navigationItems: readonly NavItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Overview', group: 'primary' },
  { path: '/servers', icon: Server, label: 'Servers', group: 'primary' },
  { path: '/monitoring', icon: Activity, label: 'Monitoring', group: 'primary' },
  { path: '/analytics', icon: Cpu, label: 'Analytics', group: 'primary' },
  { path: '/notifications', icon: Bell, label: 'Notifications', group: 'management' },
  { path: '/automation', icon: Bot, label: 'Automation', group: 'management' },
  { path: '/backup', icon: HardDrive, label: 'Backup', group: 'management' },
  { path: '/tunnel', icon: Terminal, label: 'Tunnel', group: 'management' },
  { path: '/docker', icon: Package, label: 'Docker', group: 'management' },
  { path: '/github', icon: GitBranch, label: 'GitHub', group: 'management' },
  { path: '/plugins', icon: Package, label: 'Extensions', group: 'system' },
  { path: '/security', icon: Lock, label: 'Security', group: 'system' },
  { path: '/audit', icon: FileText, label: 'Audit', group: 'system' },
  { path: '/settings', icon: Settings, label: 'Settings', group: 'system' },
];

export function getNavigationByGroup(): Record<string, NavItem[]> {
  const groups = new Map<string, NavItem[]>();
  for (const item of navigationItems) {
    const existing = groups.get(item.group);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(item.group, [item]);
    }
  }
  return Object.fromEntries(groups);
}

export function getPageLabel(path: string): string {
  const item = navigationItems.find((n) => n.path === path);
  return item?.label ?? 'Unknown';
}
