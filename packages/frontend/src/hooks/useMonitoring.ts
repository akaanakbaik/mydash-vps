import { useQuery } from '@tanstack/react-query';
import { monitoringRepository } from '../repositories/monitoring.js';
import { queryKeys } from '../api/queryKeys.js';

export function useMonitoring(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.monitoring.metrics(params),
    queryFn: () => monitoringRepository.getMetrics(params).then((res) => res.data),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useMonitoringTimeline(metric: string, range: string) {
  return useQuery({
    queryKey: queryKeys.monitoring.timeline({ metric, range }),
    queryFn: () => monitoringRepository.getTimeline(metric, range).then((res) => res.data),
    staleTime: 15_000,
  });
}
