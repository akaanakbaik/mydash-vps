import type { Request, Response } from 'express';
export interface RequestContext {
  correlationId: string;
  workspaceId: string | null;
  userId: string | null;
  startTime: number;
  method: string;
  path: string;
}
export function createRequestContext(req: Request): RequestContext {
  return {
    correlationId: String(req.headers['x-correlation-id'] ?? crypto.randomUUID()),
    workspaceId: null,
    userId: null,
    startTime: Date.now(),
    method: req.method,
    path: req.path,
  };
}
export function sendOk(res: Response, data: unknown, ctx: RequestContext): void {
  res.status(200).json({ success: true, data, correlationId: ctx.correlationId, timestamp: new Date().toISOString() });
}
export function sendCreated(res: Response, data: unknown, ctx: RequestContext): void {
  res.status(201).json({ success: true, data, correlationId: ctx.correlationId, timestamp: new Date().toISOString() });
}
export function sendNoContent(res: Response): void {
  res.status(204).send();
}
export function sendError(res: Response, statusCode: number, code: string, message: string, ctx: RequestContext, details?: Record<string, unknown>): void {
  res.status(statusCode).json({ success: false, error: { code, message, details: details ?? null }, correlationId: ctx.correlationId, timestamp: new Date().toISOString() });
}
export function broadcastEvent(req: Request, channel: string, event: string, payload: unknown): void {
  try {
    const app = req.app as unknown as { get: (key: string) => unknown };
    const wsServer = app.get('wsServer') as { broadcast: (ch: string, ev: string, pl: unknown) => void } | undefined;
    if (wsServer && typeof wsServer.broadcast === 'function') {
      wsServer.broadcast(channel, event, payload);
    }
  } catch {
  }
}
