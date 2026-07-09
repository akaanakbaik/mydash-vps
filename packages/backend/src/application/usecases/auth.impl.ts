import type { Result, AppError } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { SessionRepository } from '../../domain/auth/repository.js';
import type { UserRepository } from '../../domain/workspace/repository.js';
import type { Logger } from '../../logging/index.js';
import type { LoginRequestDTO } from '../dto/index.js';
import { hashPassword, verifyPassword, validatePasswordPolicy } from '../../infrastructure/auth/passwordService.js';
import { generateAccessToken, generateRefreshToken } from '../../api/middleware/auth.js';
import type { User, UserId } from '../../domain/workspace/entities.js';
import type { Session } from '../../domain/auth/entities.js';
import { SessionStatus } from '../../domain/auth/entities.js';

const loginMetadata: UseCaseMetadata = {
  name: 'Login',
  description: 'Authenticate user and create session',
  category: 'Auth',
  requiresAuth: false,
  idempotent: false,
  timeoutMs: 5000,
};

export class LoginUseCaseImpl implements UseCase<LoginRequestDTO, unknown> {
  public readonly metadata = loginMetadata;

  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly jwtSecret: string,
    private readonly logger: Logger,
  ) {}

  async execute(input: LoginRequestDTO, context: UseCaseContext): Promise<Result<unknown, AppError>> {
    try {
      if (!input.password) {
        return { success: false, data: null, error: { name: 'AuthError', message: 'Password is required', code: 'AUTH_MISSING_PASSWORD' } as AppError };
      }

      const workspaceId = input.workspaceId || context.workspaceId || 'default';
      const email = 'admin@mydash.local';

      let user: User | null = await this.userRepo.findByEmail(email);

      if (!user && workspaceId === 'default') {
        const now = new Date();
        const passwordHash = await hashPassword(input.password);
        const newUser: User = {
          id: crypto.randomUUID() as unknown as User['id'],
          workspaceId: workspaceId as User['workspaceId'],
          email,
          displayName: 'Administrator',
          passwordHash,
          role: 'owner',
          lastLoginAt: null,
          createdAt: now,
          updatedAt: now,
        };
        await this.userRepo.save(newUser);
        user = newUser;
        this.logger.info('first admin user created with hashed password', { email, workspaceId });
      }

      if (!user) {
        return { success: false, data: null, error: { name: 'AuthError', message: 'Invalid credentials', code: 'AUTH_INVALID_CREDENTIALS' } as AppError };
      }

      const storedHash = user.passwordHash;
      if (!storedHash) {
        const newHash = await hashPassword(input.password);
        const updatedUser: User = { ...user, passwordHash: newHash };
        await this.userRepo.save(updatedUser);
        user = updatedUser;
      } else {
        const passwordValid = await verifyPassword(input.password, storedHash);
        if (!passwordValid) {
          this.logger.warn('failed login attempt', { email, workspaceId });
          return { success: false, data: null, error: { name: 'AuthError', message: 'Invalid credentials', code: 'AUTH_INVALID_CREDENTIALS' } as AppError };
        }
      }

      const sessionId = crypto.randomUUID();
      const tokenVersion = 1;

      const accessToken = await generateAccessToken({
        userId: user.id,
        workspaceId,
        role: user.role || 'member',
        permissions: ['*'],
        tokenVersion,
        sessionId,
      }, this.jwtSecret, '24h');

      const refreshToken = await generateRefreshToken(sessionId, this.jwtSecret, '7d');

      const now = new Date();
      const session = {
        id: sessionId as unknown as Session['id'],
        workspaceId: workspaceId as unknown as Session['workspaceId'],
        userId: user.id,
        sessionIdentifier: accessToken,
        device: '',
        browser: '',
        ipAddress: '',
        operatingSystem: '',
        trusted: false,
        expiresAt: new Date(Date.now() + 86400000),
        lastActivityAt: now,
        status: SessionStatus.Active,
        createdAt: now,
        updatedAt: now,
      };

      await this.sessionRepo.save(session);
      this.logger.info('user logged in', { userId: user.id, sessionId, correlationId: context.correlationId });

      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          expiresIn: 86400,
          tokenType: 'Bearer',
          user: { id: user.id, name: user.displayName || '', email: user.email || '' },
        },
        error: null,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('login failed', error, { correlationId: context.correlationId });
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'AUTH_LOGIN_FAILED' } as AppError };
    }
  }
}

const logoutMetadata: UseCaseMetadata = {
  name: 'Logout',
  description: 'Destroy user session',
  category: 'Auth',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 3000,
};

export class LogoutUseCaseImpl implements UseCase<string, void> {
  public readonly metadata = logoutMetadata;

  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly logger: Logger,
  ) {}

  async execute(token: string, _context: UseCaseContext): Promise<Result<void, AppError>> {
    try {
      const session = await this.sessionRepo.findByToken(token);
      if (session) {
        await this.sessionRepo.delete(session.id);
      }
      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('logout failed', error);
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'AUTH_LOGOUT_FAILED' } as AppError };
    }
  }
}

const validateMetadata: UseCaseMetadata = {
  name: 'ValidateSession',
  description: 'Validate an active session token',
  category: 'Auth',
  requiresAuth: false,
  idempotent: true,
  timeoutMs: 3000,
};

export class ValidateSessionUseCaseImpl implements UseCase<string, unknown> {
  public readonly metadata = validateMetadata;

  constructor(
    private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(token: string, _context: UseCaseContext): Promise<Result<unknown, AppError>> {
    try {
      const session = await this.sessionRepo.findByToken(token);
      if (!session) {
        return { success: true, data: null, error: null };
      }
      if (session.expiresAt < new Date()) {
        return { success: true, data: null, error: null };
      }
      return { success: true, data: session, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'AUTH_VALIDATE_FAILED' } as AppError };
    }
  }
}

const changePasswordMetadata: UseCaseMetadata = {
  name: 'ChangePassword',
  description: 'Change user password',
  category: 'Auth',
  requiresAuth: true,
  idempotent: false,
  timeoutMs: 5000,
};

export class ChangePasswordUseCaseImpl implements UseCase<{ oldPassword: string; newPassword: string }, void> {
  public readonly metadata = changePasswordMetadata;

  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(input: { oldPassword: string; newPassword: string }, context: UseCaseContext): Promise<Result<void, AppError>> {
    try {
      const policy = validatePasswordPolicy(input.newPassword);
      if (!policy.valid) {
        return { success: false, data: null, error: { name: 'ValidationError', message: policy.errors.join('; '), code: 'PASSWORD_POLICY_FAILED' } as AppError };
      }

      if (!context.userId) {
        return { success: false, data: null, error: { name: 'AuthError', message: 'User not authenticated', code: 'AUTH_REQUIRED' } as AppError };
      }

      const user = await this.userRepo.findById(context.userId as unknown as UserId);
      if (!user) {
        return { success: false, data: null, error: { name: 'AuthError', message: 'User not found', code: 'AUTH_USER_NOT_FOUND' } as AppError };
      }

      const oldPasswordValid = await verifyPassword(input.oldPassword, user.passwordHash);
      if (!oldPasswordValid) {
        this.logger.warn('failed password change attempt - wrong old password', { userId: context.userId });
        return { success: false, data: null, error: { name: 'AuthError', message: 'Current password is incorrect', code: 'AUTH_INVALID_PASSWORD' } as AppError };
      }

      const newHash = await hashPassword(input.newPassword);
      const updatedUser = { ...user, passwordHash: newHash };
      await this.userRepo.save(updatedUser);

      this.logger.info('password changed', { userId: context.userId, correlationId: context.correlationId });
      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'PASSWORD_CHANGE_FAILED' } as AppError };
    }
  }
}
