import type { Result } from '@mydash/shared';
import type { AppError } from '@mydash/shared';
export interface Mapper<TDomain, TDTO> {
  toDomain(dto: TDTO): Result<TDomain, AppError>;
  toDTO(domain: TDomain): TDTO;
  toDomainList(dtos: TDTO[]): Result<TDomain[], AppError>;
  toDTOList(domains: TDomain[]): TDTO[];
}
export interface MappingContext {
  correlationId: string;
  workspaceId: string;
  locale: string;
}
