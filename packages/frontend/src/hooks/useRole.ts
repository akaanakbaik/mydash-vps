import { useQuery } from '@tanstack/react-query';
import { roleRepository } from '../repositories/role.js';
import { queryKeys } from '../api/queryKeys.js';

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: () => roleRepository.getAll().then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => roleRepository.getById(id).then((res) => res.data),
    enabled: !!id,
    staleTime: 60_000,
  });
}
