export interface Logger {
  trace(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  success(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  critical(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  emergency(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  child(metadata: Record<string, unknown>): Logger;
}

export function createLogger(service: string, level?: string): Logger {
  const logLevel = level ?? 'info';
  const levels: Record<string, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    success: 3,
    warn: 4,
    error: 5,
    critical: 6,
    emergency: 7,
  };

  const currentLevel = levels[logLevel] ?? 2;

  function writeEntry(
    severity: string,
    message: string,
    error?: Error,
    metadata?: Record<string, unknown>,
  ): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level: severity,
      service,
      message,
      error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
      metadata,
    };
    const destination = severity === 'error' || severity === 'critical' || severity === 'emergency'
      ? process.stderr
      : process.stdout;
    destination.write(`${JSON.stringify(entry)}\n`);
  }

  function method(severity: string, minLevel: number) {
    return (message: string, errorOrMeta?: Error | Record<string, unknown>, meta?: Record<string, unknown>): void => {
      if (currentLevel > minLevel) return;
      if (errorOrMeta instanceof Error) {
        writeEntry(severity, message, errorOrMeta, meta);
      } else {
        writeEntry(severity, message, undefined, errorOrMeta);
      }
    };
  }

  return {
    trace: method('trace', 0),
    debug: method('debug', 1),
    info: method('info', 2),
    success: method('success', 3),
    warn: method('warn', 4),
    error: method('error', 5),
    critical: method('critical', 6),
    emergency: method('emergency', 7),
    child: (_childMeta: Record<string, unknown>) => createLogger(service, logLevel),
  };
}
