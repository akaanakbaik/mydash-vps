import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dockerRepository } from '../repositories/docker.js';
import { queryKeys } from '../api/queryKeys.js';
export function useDocker(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.docker.containers(params),
    queryFn: () => dockerRepository.getAll(params).then((res) => res.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
export function useDockerContainers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.docker.containers(params),
    queryFn: () => dockerRepository.getContainers(params).then((res) => res.data),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
export function useRestartContainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dockerRepository.restartContainer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.docker.all });
    },
  });
}
