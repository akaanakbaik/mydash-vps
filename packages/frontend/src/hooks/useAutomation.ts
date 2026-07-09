import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationRepository } from '../repositories/automation.js';
import { queryKeys } from '../api/queryKeys.js';

export function useAutomation(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.automation.list(params),
    queryFn: () => automationRepository.getAll(params).then((res) => res.data),
    staleTime: 15_000,
  });
}

export function useTriggerWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automationRepository.triggerWorkflow(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.automation.all });
    },
  });
}
