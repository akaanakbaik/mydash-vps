import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCaseImpl, LogoutUseCaseImpl, ValidateSessionUseCaseImpl, ChangePasswordUseCaseImpl } from './auth.impl.js';
import type { UserRepository } from '../../domain/workspace/repository.js';
import type { SessionRepository } from '../../domain/auth/repository.js';
import type { Logger } from '../../logging/index.js';
import { SessionStatus } from '../../domain/auth/entities.js';
import { hashPassword } from '../../infrastructure/auth/passwordService.js';

const mockLogger: Logger = {
  trace: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  critical: vi.fn(),
  emergency: vi.fn(),
  child: vi.fn(),
};

const mockUserRepo: UserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByWorkspaceId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const mockSessionRepo: SessionRepository = {
  findById: vi.fn(),
  findByToken: vi.fn(),
  findByWorkspaceId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  expireAll: vi.fn(),
};

type DefaultContext = {
  correlationId: string;
  workspaceId: string;
  userId: string | null;
  timestamp: Date;
};

function createContext(overrides: Partial<DefaultContext> = {}): DefaultContext {
  return {
    correlationId: 'test-correlation-id',
    workspaceId: 'default',
    userId: null,
    timestamp: new Date(),
    ...overrides,
  };
}

describe('LoginUseCaseImpl', () => {
  let useCase: LoginUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new LoginUseCaseImpl(mockUserRepo, mockSessionRepo, 'test-jwt-secret', mockLogger);
  });

  it('should reject empty password', async () => {
    const result = await useCase.execute({ workspaceId: 'default', password: '' }, createContext());
    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('AUTH_MISSING_PASSWORD');
    }
  });

  it('should create admin user on first login for default workspace', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockSessionRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute({ workspaceId: 'default', password: 'TestPassword123!' }, createContext());

    expect(result.success).toBe(true);
    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('admin@mydash.local');
    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockSessionRepo.save).toHaveBeenCalled();
  });

  it('should reject invalid credentials for existing user', async () => {
    const mockUser: Record<string, unknown> = {
      id: 'user-1',
      workspaceId: 'default',
      email: 'admin@mydash.local',
      displayName: 'Admin',
      passwordHash: '$2b$12$correctHash',
      role: 'owner',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(mockUser as never);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute({ workspaceId: 'default', password: 'WrongPassword' }, createContext());

    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    }
  });
});

describe('LogoutUseCaseImpl', () => {
  let useCase: LogoutUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new LogoutUseCaseImpl(mockSessionRepo, mockLogger);
  });

  it('should delete session when token is valid', async () => {
    const mockSession: Record<string, unknown> = {
      id: 'session-1',
      workspaceId: 'default',
      userId: 'user-1',
      sessionIdentifier: 'token-123',
      device: '',
      browser: '',
      ipAddress: '',
      operatingSystem: '',
      trusted: false,
      expiresAt: new Date(Date.now() + 86400000),
      lastActivityAt: new Date(),
      status: SessionStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(mockSession as never);
    vi.mocked(mockSessionRepo.delete).mockResolvedValue(undefined);

    const result = await useCase.execute('token-123', createContext());

    expect(result.success).toBe(true);
    expect(mockSessionRepo.delete).toHaveBeenCalled();
  });

  it('should handle logout with non-existent token', async () => {
    vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(null);

    const result = await useCase.execute('invalid-token', createContext());

    expect(result.success).toBe(true);
    expect(mockSessionRepo.delete).not.toHaveBeenCalled();
  });
});

describe('ValidateSessionUseCaseImpl', () => {
  let useCase: ValidateSessionUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ValidateSessionUseCaseImpl(mockSessionRepo);
  });

  it('should return null for non-existent token', async () => {
    vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(null);

    const result = await useCase.execute('invalid-token', createContext());

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('should return null for expired session', async () => {
    const expiredSession: Record<string, unknown> = {
      id: 'session-1',
      workspaceId: 'default',
      userId: 'user-1',
      sessionIdentifier: 'token-123',
      device: '',
      browser: '',
      ipAddress: '',
      operatingSystem: '',
      trusted: false,
      expiresAt: new Date(Date.now() - 1000),
      lastActivityAt: new Date(Date.now() - 86400000),
      status: SessionStatus.Expired,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    };
    vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(expiredSession as never);

    const result = await useCase.execute('token-123', createContext());

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('should return session for valid token', async () => {
    const validSession: Record<string, unknown> = {
      id: 'session-1',
      workspaceId: 'default',
      userId: 'user-1',
      sessionIdentifier: 'token-123',
      device: '',
      browser: '',
      ipAddress: '',
      operatingSystem: '',
      trusted: false,
      expiresAt: new Date(Date.now() + 86400000),
      lastActivityAt: new Date(),
      status: SessionStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(validSession as never);

    const result = await useCase.execute('token-123', createContext());

    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
  });
});

describe('ChangePasswordUseCaseImpl', () => {
  let useCase: ChangePasswordUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ChangePasswordUseCaseImpl(mockUserRepo, mockLogger);
  });

  it('should reject weak passwords', async () => {
    const result = await useCase.execute(
      { oldPassword: 'old', newPassword: 'short' },
      createContext({ userId: 'user-1' }),
    );
    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('PASSWORD_POLICY_FAILED');
    }
  });

  it('should update password for valid request', async () => {
    const oldHash = await hashPassword('OldPassword123!');
    const mockUser: Record<string, unknown> = {
      id: 'user-1',
      workspaceId: 'default',
      email: 'admin@mydash.local',
      displayName: 'Admin',
      passwordHash: oldHash,
      role: 'owner',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockUserRepo.findById).mockResolvedValue(mockUser as never);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute(
      { oldPassword: 'OldPassword123!', newPassword: 'NewStrongPassword123!' },
      createContext({ userId: 'user-1' }),
    );

    expect(result.success).toBe(true);
    expect(mockUserRepo.save).toHaveBeenCalled();
  });

  it('should reject wrong old password', async () => {
    const oldHash = await hashPassword('RealOldPassword1!');
    const mockUser: Record<string, unknown> = {
      id: 'user-1',
      workspaceId: 'default',
      email: 'admin@mydash.local',
      displayName: 'Admin',
      passwordHash: oldHash,
      role: 'owner',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockUserRepo.findById).mockResolvedValue(mockUser as never);

    const result = await useCase.execute(
      { oldPassword: 'WrongOldPassword', newPassword: 'NewStrongPassword123!' },
      createContext({ userId: 'user-1' }),
    );

    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('AUTH_INVALID_PASSWORD');
    }
  });

  it('should reject when user is not authenticated', async () => {
    const result = await useCase.execute(
      { oldPassword: 'OldPass123!', newPassword: 'NewStrongPassword123!' },
      createContext({ userId: '' }),
    );
    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('AUTH_REQUIRED');
    }
  });

  it('should reject when user is not found', async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute(
      { oldPassword: 'OldPass123!', newPassword: 'NewStrongPassword123!' },
      createContext({ userId: 'nonexistent-user' }),
    );

    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('AUTH_USER_NOT_FOUND');
    }
  });

  it('should reject empty old password', async () => {
    const oldHash = await hashPassword('OldPassword123!');
    const mockUser: Record<string, unknown> = {
      id: 'user-1',
      workspaceId: 'default',
      email: 'admin@mydash.local',
      displayName: 'Admin',
      passwordHash: oldHash,
      role: 'owner',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockUserRepo.findById).mockResolvedValue(mockUser as never);

    const result = await useCase.execute(
      { oldPassword: '', newPassword: 'NewStrongPassword123!' },
      createContext({ userId: 'user-1' }),
    );

    expect(result.success).toBe(false);
  });

  it('should call userRepo.findById with the correct userId from context', async () => {
    const oldHash = await hashPassword('OldPassword123!');
    const mockUser: Record<string, unknown> = {
      id: 'user-1',
      workspaceId: 'default',
      email: 'admin@mydash.local',
      displayName: 'Admin',
      passwordHash: oldHash,
      role: 'owner',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockUserRepo.findById).mockResolvedValue(mockUser as never);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);

    await useCase.execute(
      { oldPassword: 'OldPassword123!', newPassword: 'NewStrongPassword123!' },
      createContext({ userId: 'specific-user-id' }),
    );

    expect(mockUserRepo.findById).toHaveBeenCalledWith(expect.anything());
  });

  it('should hash the new password before saving', async () => {
    const oldHash = await hashPassword('OldPassword123!');
    const mockUser: Record<string, unknown> = {
      id: 'user-1',
      workspaceId: 'default',
      email: 'admin@mydash.local',
      displayName: 'Admin',
      passwordHash: oldHash,
      role: 'owner',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockUserRepo.findById).mockResolvedValue(mockUser as never);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);

    await useCase.execute(
      { oldPassword: 'OldPassword123!', newPassword: 'CompletelyNewPassword456!' },
      createContext({ userId: 'user-1' }),
    );

    const savedUser = vi.mocked(mockUserRepo.save).mock.calls[0][0] as { passwordHash: string };
    const savedHash = savedUser.passwordHash;
    expect(savedHash).not.toBe(oldHash);
    expect(savedHash).toMatch(/^\$2[ab]\$\d+\$/);
  });

  it('should NOT call save if old password is wrong', async () => {
    const oldHash = await hashPassword('OldPassword123!');
    const mockUser: Record<string, unknown> = {
      id: 'user-1',
      workspaceId: 'default',
      email: 'admin@mydash.local',
      displayName: 'Admin',
      passwordHash: oldHash,
      role: 'owner',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockUserRepo.findById).mockResolvedValue(mockUser as never);

    await useCase.execute(
      { oldPassword: 'WrongPassword', newPassword: 'NewStrongPassword123!' },
      createContext({ userId: 'user-1' }),
    );

    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});
