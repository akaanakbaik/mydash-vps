import { useQuery } from '@tanstack/react-query';
import { securityRepository } from '../repositories/security.js';
import { queryKeys } from '../api/queryKeys.js';

export function useSecurity() {
  return useQuery({
    queryKey: queryKeys.security.overview(),
    queryFn: () => securityRepository.getAll().then((res) => res.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useSecurityEvents(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.security.events(params),
    queryFn: () => securityRepository.getEvents(params).then((res) => res.data),
    staleTime: 10_000,
  });
}
