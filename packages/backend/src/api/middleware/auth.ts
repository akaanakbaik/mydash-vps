import type { Request, Response, NextFunction } from 'express';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { sendError, createRequestContext } from '../../transport/http/response.js';
import type { Logger } from '../../logging/index.js';
export interface AuthPayload {
  userId: string;
  workspaceId: string;
  role: string;
  permissions: string[];
  tokenVersion: number;
  sessionId: string;
}
const encoder = new TextEncoder();
async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    if (!secret || secret === 'dev-secret') return null;
    const secretKey = encoder.encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
      issuer: 'mydash',
    });
    return payload;
  } catch {
    return null;
  }
}
export function createJWTSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  let result = '';
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  for (let i = 0; i < 64; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}
export function authenticateMiddleware(secret: string, logger: Logger) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ctx = createRequestContext(req);
    const publicPaths = ['/auth/login', '/auth/register', '/health', '/live', '/ready', '/version'];
    const basePath = '/api/v1';
    const relativePath = req.path.startsWith(basePath) ? req.path.slice(basePath.length) : req.path;
    if (publicPaths.some(p => relativePath === p || relativePath.startsWith(p + '/'))) {
      next();
      return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'AUTH_MISSING_TOKEN', 'Missing or invalid authorization header', ctx);
      return;
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      sendError(res, 401, 'AUTH_EMPTY_TOKEN', 'Empty token', ctx);
      return;
    }
    try {
      const payload = await verifyJWT(token, secret);
      if (!payload) {
        sendError(res, 401, 'AUTH_INVALID_TOKEN', 'Invalid or expired token', ctx);
        return;
      }
      const sub = payload.sub;
      if (!sub || typeof sub !== 'string') {
        sendError(res, 401, 'AUTH_INVALID_TOKEN', 'Token missing subject', ctx);
        return;
      }
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && now > payload.exp) {
        sendError(res, 401, 'AUTH_TOKEN_EXPIRED', 'Token has expired', ctx);
        return;
      }
      if (payload.nbf && now < payload.nbf) {
        sendError(res, 401, 'AUTH_TOKEN_NOT_YET_VALID', 'Token is not yet valid', ctx);
        return;
      }
      req.auth = {
        userId: sub,
        workspaceId: typeof payload.ws === 'string' ? payload.ws : '',
        role: typeof payload.role === 'string' ? payload.role : 'user',
        permissions: Array.isArray(payload.perms) ? payload.perms.map(String) : [],
        tokenVersion: typeof payload.tkv === 'number' ? payload.tkv : 0,
        sessionId: typeof payload.sid === 'string' ? payload.sid : '',
      };
      logger.debug('auth success', { userId: sub, path: req.path, method: req.method });
      next();
    } catch {
      sendError(res, 401, 'AUTH_VERIFICATION_FAILED', 'Token verification failed', ctx);
    }
  };
}
export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ctx = createRequestContext(req);
    if (!req.auth) {
      sendError(res, 401, 'AUTH_REQUIRED', 'Authentication required', ctx);
      return;
    }
    const hasAll = permissions.every((p) => req.auth?.permissions.includes(p) ?? false);
    if (!hasAll) {
      sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions', ctx);
      return;
    }
    next();
  };
}
export function requireWorkspace(workspaceParam = 'workspaceId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ctx = createRequestContext(req);
    const queryWs = req.query[workspaceParam];
    const queryStr = Array.isArray(queryWs) ? queryWs[0] : typeof queryWs === 'string' ? queryWs : '';
    const requestedWs = req.params[workspaceParam] || queryStr || '';
    if (requestedWs && req.auth && requestedWs !== req.auth.workspaceId) {
      sendError(res, 403, 'FORBIDDEN_WORKSPACE', 'Workspace mismatch', ctx);
      return;
    }
    next();
  };
}
export async function generateAccessToken(
  payload: {
    userId: string;
    workspaceId: string;
    role: string;
    permissions: string[];
    tokenVersion: number;
    sessionId: string;
  },
  secret: string,
  expiresIn: string | number = '24h',
): Promise<string> {
  const secretKey = encoder.encode(secret);
  const exp = typeof expiresIn === 'number' ? expiresIn : parseDuration(expiresIn);
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    sub: payload.userId,
    ws: payload.workspaceId,
    role: payload.role,
    perms: payload.permissions,
    tkv: payload.tokenVersion,
    sid: payload.sessionId,
    iat: now,
    nbf: now,
    exp: now + exp,
    iss: 'mydash',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secretKey);
}
export async function generateRefreshToken(
  sessionId: string,
  secret: string,
  expiresIn: string | number = '7d',
): Promise<string> {
  const secretKey = encoder.encode(secret);
  const exp = typeof expiresIn === 'number' ? expiresIn : parseDuration(expiresIn);
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    sub: sessionId,
    typ: 'refresh',
    iat: now,
    nbf: now,
    exp: now + exp,
    iss: 'mydash',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secretKey);
}
export async function verifyRefreshToken(token: string, secret: string): Promise<{ sessionId: string } | null> {
  try {
    const secretKey = encoder.encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
      issuer: 'mydash',
    });
    if (payload.typ !== 'refresh') return null;
    const sub = payload.sub;
    if (!sub || typeof sub !== 'string') return null;
    return { sessionId: sub };
  } catch {
    return null;
  }
}
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 86400;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return value;
  }
}
