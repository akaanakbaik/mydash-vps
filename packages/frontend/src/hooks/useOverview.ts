import { useQuery } from '@tanstack/react-query';
import { overviewRepository } from '../repositories/overview.js';
import { queryKeys } from '../api/queryKeys.js';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.overview.detail(),
    queryFn: () => overviewRepository.getDashboard().then((res) => res.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
