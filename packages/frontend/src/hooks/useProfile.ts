import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileRepository } from '../repositories/profile.js';
import { queryKeys } from '../api/queryKeys.js';
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.detail(),
    queryFn: () => profileRepository.get().then((res) => res.data),
    staleTime: 60_000,
  });
}
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => profileRepository.update(data as Parameters<typeof profileRepository.update>[0]),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}
