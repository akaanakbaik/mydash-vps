import { Router, type Express } from 'express';

export class RouterRegistry {
  private readonly routers = new Map<string, Router>();

  registerRouter(prefix: string, router: Router): void {
    this.routers.set(prefix, router);
  }

  mount(app: Express): void {
    for (const [prefix, router] of this.routers) {
      app.use(prefix, router);
    }
  }
}

export function createReadinessRouter(healthCheckFn: () => Promise<boolean>): Router {
  const router = Router();
  router.get('/ready', async (_req, res) => {
    try {
      const healthy = await healthCheckFn();
      if (healthy) {
        res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
      } else {
        res.status(503).json({ status: 'not_ready', timestamp: new Date().toISOString() });
      }
    } catch {
      res.status(503).json({ status: 'not_ready', timestamp: new Date().toISOString() });
    }
  });
  return router;
}
