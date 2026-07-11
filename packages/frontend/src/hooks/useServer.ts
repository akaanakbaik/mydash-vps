import { useQuery } from '@tanstack/react-query';
import { serverRepository } from '../repositories/server.js';
import { queryKeys } from '../api/queryKeys.js';
export function useServers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.servers.list(params),
    queryFn: () => serverRepository.getAll(params).then((res) => res.data),
  });
}
export function useServer(id: string) {
  return useQuery({
    queryKey: queryKeys.servers.detail(id),
    queryFn: () => serverRepository.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}
