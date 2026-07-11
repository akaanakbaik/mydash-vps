import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backupRepository } from '../repositories/backup.js';
import { queryKeys } from '../api/queryKeys.js';
export function useBackupSummary() {
  return useQuery({
    queryKey: queryKeys.backup.summary(),
    queryFn: () => backupRepository.getSummary().then((res) => res.data),
    staleTime: 30_000,
  });
}
export function useBackupHistory(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.backup.history(params),
    queryFn: () => backupRepository.getHistory(params).then((res) => res.data),
    staleTime: 15_000,
  });
}
export function useTriggerBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: string) => backupRepository.triggerBackup(type),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.backup.all });
    },
  });
}
export function useRestoreBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (backupId: number) => backupRepository.restore(backupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.backup.all });
    },
  });
}
