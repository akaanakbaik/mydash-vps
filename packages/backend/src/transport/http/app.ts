import express, { type Express, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Logger } from '../../logging/index.js';
import { correlationIdMiddleware, requestLoggerMiddleware, errorHandlerMiddleware, notFoundMiddleware, validationMiddleware, rateLimiterMiddleware } from './middleware.js';
import { createApiRouter } from '../../api/routes/index.js';
import type { ServiceRegistry } from '../../application/registry/serviceRegistry.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function resolveFrontendDist(): string | null {
  const candidates = [
    path.resolve(__dirname, '..', '..', '..', '..', 'frontend', 'dist'),
    '/app/packages/frontend/dist',
    path.resolve(process.cwd(), '..', 'frontend', 'dist'),
  ];
  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, 'index.html'))) {
        return dir;
      }
    } catch {  }
  }
  return null;
}
export function createExpressApp(logger: Logger, jwtSecret: string, registry?: ServiceRegistry): Express {
  const app = express();
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
    xContentTypeOptions: false as const,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
  }));
  app.use(cors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id', 'X-Request-Id'],
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(correlationIdMiddleware());
  app.use(requestLoggerMiddleware(logger));
  app.use(validationMiddleware());
  app.use(rateLimiterMiddleware(100, 60000));
  const frontendDist = resolveFrontendDist();
  if (frontendDist) {
    logger.info(`Serving static frontend from ${frontendDist}`);
    app.use(express.static(frontendDist, {
      maxAge: '1y',
      immutable: true,
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }));
    const apiPaths = ['/api/', '/health', '/ready', '/live', '/version', '/ws'];
    app.use((req, res, next) => {
      if (req.method === 'GET' && !apiPaths.some(p => req.path.startsWith(p)) && !path.extname(req.path)) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(path.join(frontendDist, 'index.html'));
        return;
      }
      next();
    });
  } else {
    logger.warn('Frontend dist not found - API only mode');
  }
  const root = Router();
  root.get('/health', (_req, res) => { res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }); });
  root.get('/ready', (_req, res) => { res.json({ status: 'ready', timestamp: new Date().toISOString() }); });
  root.get('/live', (_req, res) => { res.json({ status: 'alive', timestamp: new Date().toISOString() }); });
  root.get('/version', (_req, res) => { res.json({ version: '0.1.0', build: process.env['BUILD_ID'] ?? 'dev', timestamp: new Date().toISOString() }); });
  app.use('/', root);
  const apiRouter = createApiRouter(logger, jwtSecret, registry);
  app.use('/api/v1', apiRouter);
  app.use(notFoundMiddleware());
  app.use(errorHandlerMiddleware(logger));
  return app;
}
