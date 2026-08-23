import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys.js';
import { observabilityRepository, type ObservabilityRange } from '../repositories/observability.js';

export function useObservability(range: ObservabilityRange) {
  return useQuery({
    queryKey: queryKeys.observability.overview(range),
    queryFn: () => observabilityRepository.getOverview(range).then((response) => response.data),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
