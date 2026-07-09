import type { ApiErrorBody } from './types.js';

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: Record<string, string[]> | null;
  public readonly correlationId: string;

  constructor(status: number, body: ApiErrorBody, correlationId: string) {
    super(body.message);
    this.name = 'ApiError';
    this.code = body.code;
    this.status = status;
    this.details = body.details;
    this.correlationId = correlationId;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timed out after ${String(timeout)}ms`);
    this.name = 'TimeoutError';
  }
}

export class AbortError extends Error {
  constructor() {
    super('Request was aborted');
    this.name = 'AbortError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(body: ApiErrorBody, correlationId: string) {
    super(401, body, correlationId);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(body: ApiErrorBody, correlationId: string) {
    super(403, body, correlationId);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(body: ApiErrorBody, correlationId: string) {
    super(404, body, correlationId);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(body: ApiErrorBody, correlationId: string) {
    super(422, body, correlationId);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ApiError {
  constructor(body: ApiErrorBody, correlationId: string) {
    super(429, body, correlationId);
    this.name = 'RateLimitError';
  }
}

export function parseApiError(status: number, body: ApiErrorBody, correlationId: string): ApiError {
  switch (status) {
    case 401: return new UnauthorizedError(body, correlationId);
    case 403: return new ForbiddenError(body, correlationId);
    case 404: return new NotFoundError(body, correlationId);
    case 422: return new ValidationError(body, correlationId);
    case 429: return new RateLimitError(body, correlationId);
    default: return new ApiError(status, body, correlationId);
  }
}
