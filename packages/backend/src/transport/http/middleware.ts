import type { Request, Response, NextFunction } from 'express';
import type { Logger } from '../../logging/index.js';
import { sendError, createRequestContext } from './response.js';
export function correlationIdMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.headers['x-correlation-id']) {
      req.headers['x-correlation-id'] = crypto.randomUUID();
    }
    next();
  };
}
export function requestLoggerMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ctx = createRequestContext(req);
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      logger.info(`${req.method} ${req.path} ${String(res.statusCode)}`, { correlationId: ctx.correlationId, durationMs });
    });
    next();
  };
}
export function errorHandlerMiddleware(logger: Logger) {
  return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    const ctx = createRequestContext(req);
    logger.error(`unhandled error: ${err.message}`);
    sendError(res, 500, 'INTERNAL_ERROR', err.message, ctx);
  };
}
export function notFoundMiddleware() {
  return (req: Request, res: Response): void => {
    const ctx = createRequestContext(req);
    sendError(res, 404, 'NOT_FOUND', `Route not found: ${req.method} ${req.path}`, ctx);
  };
}
export function validationMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      if (req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
        const ctx = createRequestContext(req);
        sendError(res, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json', ctx);
        return;
      }
    }
    next();
  };
}
export function rateLimiterMiddleware(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetAt: number }>();
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of requests) {
      if (now > v.resetAt) requests.delete(k);
    }
  }, 60000);
  cleanupTimer.unref();
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const entry = requests.get(key);
    if (!entry || now > entry.resetAt) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    entry.count++;
    if (entry.count > maxRequests) {
      const ctx = createRequestContext(req);
      sendError(res, 429, 'RATE_LIMITED', 'Too many requests', ctx);
      return;
    }
    next();
  };
}
