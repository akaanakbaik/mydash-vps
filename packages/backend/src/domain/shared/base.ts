export type DomainId = string & { readonly __brand: 'DomainId' };

export interface DomainEntity<TId = DomainId> {
  readonly id: TId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AggregateRoot<TId = DomainId> extends DomainEntity<TId> {
  readonly version: number;
}
