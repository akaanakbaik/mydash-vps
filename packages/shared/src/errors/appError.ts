export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly severity: string;
  readonly correlationId: string;
  readonly details: Record<string, unknown> | null;

  constructor(params: {
    code: string;
    message: string;
    statusCode: number;
    severity: string;
    correlationId: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.severity = params.severity;
    this.correlationId = params.correlationId;
    this.details = params.details ?? null;
  }
}
