import { useQuery } from '@tanstack/react-query';
import { auditRepository } from '../repositories/audit.js';
import { queryKeys } from '../api/queryKeys.js';
export function useAudit(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.audit.records(params),
    queryFn: () => auditRepository.getAll(params).then((res) => res.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
