import type { UseCase } from './base.js';
import type { Session } from '@mydash/shared';
import type { LoginRequestDTO } from '../dto/index.js';

export interface LoginUseCase extends UseCase<LoginRequestDTO, Session> {}
export interface LogoutUseCase extends UseCase<string, void> {}
export interface ValidateSessionUseCase extends UseCase<string, Session | null> {}
