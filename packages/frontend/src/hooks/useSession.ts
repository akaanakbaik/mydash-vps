import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionRepository } from '../repositories/session.js';
import { queryKeys } from '../api/queryKeys.js';

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: () => sessionRepository.getAll().then((res) => res.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionRepository.revoke(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}
