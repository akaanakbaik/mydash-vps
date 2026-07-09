import { useQuery } from '@tanstack/react-query';
import { tunnelRepository } from '../repositories/tunnel.js';
import { queryKeys } from '../api/queryKeys.js';

export function useTunnel() {
  return useQuery({
    queryKey: queryKeys.tunnel.overview(),
    queryFn: () => tunnelRepository.getOverview().then((res) => res.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useTunnelSessions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.tunnel.sessions(params),
    queryFn: () => tunnelRepository.getSessions(params).then((res) => res.data),
    staleTime: 10_000,
  });
}
