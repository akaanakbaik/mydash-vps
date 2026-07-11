import { useQuery } from '@tanstack/react-query';
import { notificationRepository } from '../repositories/notification.js';
import { queryKeys } from '../api/queryKeys.js';
export function useNotifications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationRepository.getAll(params).then((res) => res.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
export function useNotificationRules() {
  return useQuery({
    queryKey: queryKeys.notifications.rules(),
    queryFn: () => notificationRepository.getRules().then((res) => res.data),
    staleTime: 60_000,
  });
}
export function useNotificationProviders() {
  return useQuery({
    queryKey: queryKeys.notifications.providers(),
    queryFn: () => notificationRepository.getProviders().then((res) => res.data),
    staleTime: 60_000,
  });
}
