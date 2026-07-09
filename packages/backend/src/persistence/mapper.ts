import type { Result } from '@mydash/shared';
import type { AppError } from '@mydash/shared';
import { type Mapper } from '../application/index.js';

export abstract class PersistenceMapper<TDomain, TDTO, TPersistence> implements Mapper<TDomain, TDTO> {
  abstract toDomain(dto: TDTO): Result<TDomain, AppError>;
  abstract toDTO(domain: TDomain): TDTO;
  abstract toPersistence(domain: TDomain): TPersistence;
  abstract fromPersistence(persistence: TPersistence): Result<TDomain, AppError>;

  toDomainList(dtos: TDTO[]): Result<TDomain[], AppError> {
    const results: TDomain[] = [];
    for (const dto of dtos) {
      const result = this.toDomain(dto);
      if (!result.success) return result;
      results.push(result.data);
    }
    return { success: true, data: results, error: null };
  }

  toDTOList(domains: TDomain[]): TDTO[] {
    return domains.map((d) => this.toDTO(d));
  }
}
