import { useQuery } from '@tanstack/react-query';
import { githubRepository } from '../repositories/github.js';
import { queryKeys } from '../api/queryKeys.js';

export function useGitHub() {
  return useQuery({
    queryKey: queryKeys.github.repositories(),
    queryFn: () => githubRepository.getAll().then((res) => res.data),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useGitHubWorkflows() {
  return useQuery({
    queryKey: queryKeys.github.workflows(),
    queryFn: () => githubRepository.getWorkflows().then((res) => res.data),
    staleTime: 30_000,
  });
}
