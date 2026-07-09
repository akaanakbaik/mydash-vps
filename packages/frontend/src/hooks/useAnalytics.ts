import { useQuery } from '@tanstack/react-query';
import { analyticsRepository } from '../repositories/analytics.js';
import { queryKeys } from '../api/queryKeys.js';

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.summary(),
    queryFn: () => analyticsRepository.getSummary().then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useAnalyticsTrends(metric: string, range: string) {
  return useQuery({
    queryKey: queryKeys.analytics.trends({ metric, range }),
    queryFn: () => analyticsRepository.getTrends(metric, range).then((res) => res.data),
    staleTime: 30_000,
  });
}

export function useAnalyticsAnomalies() {
  return useQuery({
    queryKey: queryKeys.analytics.anomalies(),
    queryFn: () => analyticsRepository.getAnomalies().then((res) => res.data),
    staleTime: 60_000,
  });
}
