import { AppError } from '@mydash/shared';
export function translateError(error: unknown, correlationId: string, defaultCode: string = 'INTERNAL_ERROR'): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError({
      code: defaultCode,
      message: error.message,
      statusCode: 500,
      severity: 'error',
      correlationId,
    });
  }
  return new AppError({
    code: defaultCode,
    message: String(error),
    statusCode: 500,
    severity: 'error',
    correlationId,
  });
}
export function notFound(entity: string, id: string, correlationId: string): AppError {
  return new AppError({
    code: 'NOT_FOUND',
    message: `${entity} not found: ${id}`,
    statusCode: 404,
    severity: 'warning',
    correlationId,
  });
}
export function validationError(message: string, correlationId: string): AppError {
  return new AppError({
    code: 'VALIDATION_ERROR',
    message,
    statusCode: 400,
    severity: 'warning',
    correlationId,
  });
}
