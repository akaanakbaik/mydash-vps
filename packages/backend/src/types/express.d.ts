import type { AuthPayload } from '../api/middleware/auth.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export {};
