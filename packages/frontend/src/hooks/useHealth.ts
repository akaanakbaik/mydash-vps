import { useQuery } from '@tanstack/react-query';
import { healthRepository } from '../repositories/health.js';
import { queryKeys } from '../api/queryKeys.js';

export function useHealthScore() {
  return useQuery({
    queryKey: queryKeys.health.score(),
    queryFn: () => healthRepository.getScore().then((res) => res.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useHealthHistory(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.health.history(params),
    queryFn: () => healthRepository.getHistory(params).then((res) => res.data),
    staleTime: 60_000,
  });
}
