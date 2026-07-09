import { apiClient } from '../api/client.js';

export interface RoleData {
  id: string; name: string; description: string; usersCount: number;
  permissions: Record<string, string[]>; isSystem: boolean; createdAt: string;
}

export interface PermissionResource {
  id: string; label: string; actions: { id: string; label: string }[];
}

export interface RoleResponse {
  roles: RoleData[];
  resources: PermissionResource[];
}

export const roleRepository = {
  getAll: () =>
    apiClient.get<RoleResponse>('/roles'),
  getById: (id: string) =>
    apiClient.get<RoleData>(`/roles/${id}`),
};
