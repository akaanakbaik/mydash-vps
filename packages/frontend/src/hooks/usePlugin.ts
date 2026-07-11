import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pluginRepository } from '../repositories/plugin.js';
import { queryKeys } from '../api/queryKeys.js';
export function usePlugins(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.plugins.list(params),
    queryFn: () => pluginRepository.getAll(params).then((res) => res.data),
    staleTime: 30_000,
  });
}
export function usePluginMarketplace() {
  return useQuery({
    queryKey: queryKeys.plugins.marketplace(),
    queryFn: () => pluginRepository.getMarketplace().then((res) => res.data),
    staleTime: 60_000,
  });
}
export function useInstallPlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pluginRepository.install(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all });
    },
  });
}
export function useUninstallPlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pluginRepository.uninstall(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all });
    },
  });
}
