import { AppError } from '@mydash/shared';

export function mapDatabaseError(error: unknown, correlationId: string): AppError {
  const message = error instanceof Error ? error.message : String(error);
  const code = mapErrorCode(message);

  return new AppError({
    code,
    message: `Database error: ${message}`,
    statusCode: mapStatusCode(code),
    severity: 'error',
    correlationId,
  });
}

function mapErrorCode(message: string): string {
  if (message.includes('duplicate key')) return 'DB_DUPLICATE';
  if (message.includes('foreign key')) return 'DB_FOREIGN_KEY';
  if (message.includes('not-null constraint')) return 'DB_NOT_NULL';
  if (message.includes('unique constraint')) return 'DB_UNIQUE_VIOLATION';
  if (message.includes('check constraint')) return 'DB_CHECK_VIOLATION';
  if (message.includes('deadlock')) return 'DB_DEADLOCK';
  if (message.includes('connection') || message.includes('timeout')) return 'DB_CONNECTION';
  return 'DB_UNKNOWN';
}

function mapStatusCode(code: string): number {
  if (code === 'DB_DUPLICATE') return 409;
  if (code === 'DB_FOREIGN_KEY') return 400;
  if (code === 'DB_NOT_NULL') return 400;
  if (code === 'DB_CONNECTION') return 503;
  return 500;
}
