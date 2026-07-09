// Mock Role & Permission data provider — replace with real Role Engine later.

export interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: Record<string, string[]>;
  isSystem: boolean;
  createdAt: string;
}

export interface PermissionResource {
  id: string;
  label: string;
  actions: { id: string; label: string }[];
}

export interface RoleData {
  roles: Role[];
  resources: PermissionResource[];
}

const defaultResources: string[] = [
  'dashboard', 'monitoring', 'analytics', 'health', 'notification',
  'automation', 'backup', 'docker', 'tunnel', 'github', 'plugin',
  'security', 'audit', 'settings', 'users', 'roles',
];

const defaultActions = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'manage', label: 'Manage' },
];

function daysAgo(d: number) { return new Date(Date.now() - d * 86400000).toISOString(); }

export function getMockRoleData(): RoleData {
  return {
    resources: defaultResources.map((r) => ({
      id: r,
      label: r.charAt(0).toUpperCase() + r.slice(1),
      actions: defaultActions,
    })),
    roles: [
      {
        id: 'role-owner',
        name: 'Owner',
        description: 'Full access to all resources and settings',
        usersCount: 1,
        isSystem: true,
        createdAt: daysAgo(365),
        permissions: Object.fromEntries(defaultResources.map((r): [string, string[]] => [r, ['view', 'create', 'edit', 'delete', 'manage']])),
      },
      {
        id: 'role-admin',
        name: 'Administrator',
        description: 'Full access except billing and system settings',
        usersCount: 3,
        isSystem: true,
        createdAt: daysAgo(365),
        permissions: Object.fromEntries(defaultResources.map((r): [string, string[]] => [r, ['view', 'create', 'edit', 'delete', 'manage']])),
      },
      {
        id: 'role-operator',
        name: 'Operator',
        description: 'Can manage monitoring, backups, and automation',
        usersCount: 5,
        isSystem: true,
        createdAt: daysAgo(180),
        permissions: Object.fromEntries(defaultResources.map((r): [string, string[]] => {
          if (['dashboard', 'monitoring', 'notification', 'automation', 'backup', 'docker', 'tunnel'].includes(r)) {
            return [r, ['view', 'create', 'edit']];
          }
          if (['github', 'plugin', 'health', 'analytics'].includes(r)) {
            return [r, ['view']];
          }
          return [r, ['view']];
        })),
      },
      {
        id: 'role-readonly',
        name: 'Read Only',
        description: 'View-only access to all dashboards',
        usersCount: 8,
        isSystem: true,
        createdAt: daysAgo(90),
        permissions: Object.fromEntries(defaultResources.map((r): [string, string[]] => [r, ['view']])),
      },
      {
        id: 'role-custom',
        name: 'DevOps',
        description: 'Custom role for DevOps team with infrastructure access',
        usersCount: 2,
        isSystem: false,
        createdAt: daysAgo(60),
        permissions: Object.fromEntries(defaultResources.map((r): [string, string[]] => {
          if (['dashboard', 'monitoring', 'health', 'analytics', 'notification', 'automation', 'backup', 'docker', 'tunnel', 'github', 'plugin'].includes(r)) {
            return [r, ['view', 'create', 'edit', 'delete']];
          }
          return [r, ['view']];
        })),
      },
    ],
  };
}
