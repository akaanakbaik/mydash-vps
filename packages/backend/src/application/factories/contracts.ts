import type { UseCaseContext } from '../usecases/base.js';
import type { UseCase } from '../usecases/base.js';
export interface ServiceFactory<TService> {
  create(context: UseCaseContext): Promise<TService>;
}
export interface RepositoryFactory<TRepository> {
  create(context: UseCaseContext): Promise<TRepository>;
}
export interface ApplicationFactory {
  createService<T>(serviceType: string, context: UseCaseContext): Promise<T>;
  createRepository<T>(repositoryType: string, context: UseCaseContext): Promise<T>;
  createUseCase<TInput, TOutput>(useCaseName: string): UseCase<TInput, TOutput>;
}
