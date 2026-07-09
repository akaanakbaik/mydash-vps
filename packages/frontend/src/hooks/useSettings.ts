import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsRepository, type SettingUpdate } from '../repositories/settings.js';
import { queryKeys } from '../api/queryKeys.js';

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.list(),
    queryFn: () => settingsRepository.getAll().then((res) => res.data),
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: SettingUpdate[]) => settingsRepository.update(updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
