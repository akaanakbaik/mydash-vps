import type { Result, AppError } from '@mydash/shared';

export interface DomainFactory<T, TCreate> {
  create(input: TCreate): Result<T, AppError>;
}

export interface DomainPolicy<TCheck> {
  isSatisfiedBy(candidate: TCheck): boolean;
  reason(): string;
}

export interface DomainSpecification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: DomainSpecification<T>): DomainSpecification<T>;
  or(other: DomainSpecification<T>): DomainSpecification<T>;
  not(): DomainSpecification<T>;
}

export interface DomainValidator<T> {
  validate(input: unknown): Result<T, AppError>;
}

export interface DomainMapper<TDomain, TDTO> {
  toDomain(dto: TDTO): TDomain;
  toDTO(domain: TDomain): TDTO;
}

export interface DomainContext {
  workspaceId: string;
  userId: string;
  correlationId: string;
  timestamp: Date;
}

export interface DomainRegistry<T> {
  register(key: string, instance: T): void;
  resolve(key: string): T | undefined;
  entries(): Map<string, T>;
}

export interface DomainMetadata {
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DomainLifecycle {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  isReady(): boolean;
}
