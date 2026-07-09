export class AuthError extends Error {
  constructor(code: string, message: string) {
    super(message);
    this.name = code;
  }
}

export class InvalidPasswordError extends AuthError {
  constructor() {
    super('AUTH_INVALID_PASSWORD', 'Invalid password');
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super('AUTH_SESSION_EXPIRED', 'Session has expired');
  }
}

export class BruteForceError extends AuthError {
  constructor(retryAfterMs: number) {
    super('AUTH_BRUTE_FORCE', `Too many attempts. Retry after ${String(retryAfterMs)}ms`);
  }
}
