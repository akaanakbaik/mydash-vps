import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys.js';

type CacheUpdater = (client: QueryClient, event: RealtimeEvent) => void;

interface RealtimeEvent {
  id: string;
  type: string;
  channel: string;
  sequence: number;
  version: number;
  timestamp: string;
  payload: unknown;
  correlationId: string;
  traceId: string;
  workspaceId: string;
  serverId?: string;
}

/**
 * Maps event types to React Query cache update functions.
 * Each handler updates only the affected part of the cache using
 * setQueryData instead of invalidateQueries to avoid full refetches.
 */
export function createQuerySyncMap(_queryClient: QueryClient): Map<string, CacheUpdater> {
  const sync = new Map<string, CacheUpdater>();

  /* ─── Dashboard ─── */

  sync.set('metric.updated', (client, event) => {
    const payload = event.payload as Record<string, unknown> | undefined;
    if (!payload) return;
    client.setQueryData(queryKeys.overview.detail(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      return { ...(old as Record<string, unknown>), ...payload };
    });
  });

  /* ─── Monitoring ─── */

  sync.set('metric.ingested', (client, event) => {
    const payload = event.payload as Record<string, unknown> | undefined;
    if (!payload?.metric) return;
    const metric = payload.metric as string;
    const val = payload.value as number | undefined;
    client.setQueryData(queryKeys.monitoring.metrics(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      if (metric in data && val !== undefined) {
        const existing = data[metric] as Record<string, unknown> | undefined;
        return { ...data, [metric]: { ...(existing ?? {}), usagePercent: val } };
      }
      return data;
    });
  });

  sync.set('metric.deleted', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.monitoring.metrics() });
  });

  /* ─── Analytics ─── */

  sync.set('analytics.generated', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.analytics.summary() });
    void client.invalidateQueries({ queryKey: queryKeys.analytics.trends({}) });
    void client.invalidateQueries({ queryKey: queryKeys.analytics.anomalies() });
  });

  sync.set('analytics.updated', (client, event) => {
    const payload = event.payload as { trends?: unknown[]; anomalies?: unknown[] } | undefined;
    if (!payload) return;

    if (payload.trends) {
      client.setQueryData(queryKeys.analytics.trends({}), payload.trends);
    }
    if (payload.anomalies) {
      client.setQueryData(queryKeys.analytics.anomalies(), payload.anomalies);
    }
  });

  /* ─── Health ─── */

  sync.set('health.updated', (client, event) => {
    const payload = event.payload as Record<string, unknown> | undefined;
    if (!payload) return;
    client.setQueryData(queryKeys.health.score(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      return { ...(old as Record<string, unknown>), ...payload };
    });
  });

  sync.set('health.changed', (client, event) => {
    const payload = event.payload as Record<string, unknown> | undefined;
    if (payload) {
      client.setQueryData(queryKeys.health.score(), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        return { ...(old as Record<string, unknown>), ...payload };
      });
    }
  });

  /* ─── Notification ─── */

  sync.set('notification.created', (client, event) => {
    const payload = event.payload as Record<string, unknown> | undefined;
    if (!payload) return;
    client.setQueryData(queryKeys.notifications.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const history = Array.isArray(data.history) ? [...(data.history as unknown[])] : [];
      history.unshift(payload);
      const summary = typeof data.summary === 'object' && data.summary !== null
        ? { ...(data.summary as Record<string, unknown>), totalSent: ((data.summary as Record<string, number | undefined>).totalSent ?? 0) + 1 }
        : data.summary;
      return { ...data, history, summary };
    });
  });

  sync.set('notification.sent', (client, event) => {
    const payload = event.payload as { id?: string; status?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.notifications.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const history = Array.isArray(data.history) ? data.history.map((h: Record<string, unknown>) =>
        h.id === payload.id ? { ...h, ...payload } : h
      ) : data.history;
      return { ...data, history };
    });
  });

  sync.set('notification.failed', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.notifications.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const summary = typeof data.summary === 'object' && data.summary !== null
        ? { ...(data.summary as Record<string, unknown>), failed: ((data.summary as Record<string, number | undefined>).failed ?? 0) + 1 }
        : data.summary;
      const history = Array.isArray(data.history) ? data.history.map((h: Record<string, unknown>) =>
        h.id === payload.id ? { ...h, status: 'failed', ...payload } : h
      ) : data.history;
      return { ...data, summary, history };
    });
  });

  /* ─── Automation ─── */

  sync.set('automation.started', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.automation.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const workflows = Array.isArray(data.workflows) ? data.workflows.map((w: Record<string, unknown>) =>
        w.id === payload.id ? { ...w, status: 'running' } : w
      ) : data.workflows;
      return { ...data, workflows };
    });
  });

  sync.set('automation.completed', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.automation.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const workflows = Array.isArray(data.workflows) ? data.workflows.map((w: Record<string, unknown>) =>
        w.id === payload.id ? { ...w, status: 'success', ...payload } : w
      ) : data.workflows;
      return { ...data, workflows };
    });
  });

  sync.set('automation.failed', (client, event) => {
    const payload = event.payload as { id?: string; error?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.automation.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const workflows = Array.isArray(data.workflows) ? data.workflows.map((w: Record<string, unknown>) =>
        w.id === payload.id ? { ...w, status: 'failed', error: payload.error } : w
      ) : data.workflows;
      const summary = typeof data.summary === 'object' && data.summary !== null
        ? { ...(data.summary as Record<string, unknown>), failed: ((data.summary as Record<string, number | undefined>).failed ?? 0) + 1 }
        : data.summary;
      return { ...data, workflows, summary };
    });
  });

  sync.set('automation.cancelled', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.automation.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const workflows = Array.isArray(data.workflows) ? data.workflows.map((w: Record<string, unknown>) =>
        w.id === payload.id ? { ...w, status: 'cancelled' } : w
      ) : data.workflows;
      return { ...data, workflows };
    });
  });

  /* ─── Server ─── */

  sync.set('server.updated', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.servers.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const servers = Array.isArray(data.servers) ? data.servers.map((s: Record<string, unknown>) =>
        s.id === payload.id ? { ...s, ...payload } : s
      ) : data.servers;
      return { ...data, servers };
    });
  });

  sync.set('server.online', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.servers.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const servers = Array.isArray(data.servers) ? data.servers.map((s: Record<string, unknown>) =>
        s.id === payload.id ? { ...s, status: 'online', ...payload } : s
      ) : data.servers;
      const onlineCount = Array.isArray(servers) ? servers.filter((s: Record<string, unknown>) => s.status === 'online').length : data.onlineCount;
      return { ...data, servers, onlineCount };
    });
  });

  sync.set('server.offline', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.servers.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const servers = Array.isArray(data.servers) ? data.servers.map((s: Record<string, unknown>) =>
        s.id === payload.id ? { ...s, status: 'offline', ...payload } : s
      ) : data.servers;
      const offlineCount = Array.isArray(servers) ? servers.filter((s: Record<string, unknown>) => s.status === 'offline').length : data.offlineCount;
      return { ...data, servers, offlineCount };
    });
  });

  sync.set('server.degraded', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.servers.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const servers = Array.isArray(data.servers) ? data.servers.map((s: Record<string, unknown>) =>
        s.id === payload.id ? { ...s, status: 'degraded', ...payload } : s
      ) : data.servers;
      return { ...data, servers };
    });
  });

  sync.set('server.created', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.servers.list() });
  });

  sync.set('server.deleted', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.servers.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const servers = Array.isArray(data.servers) ? data.servers.filter((s: Record<string, unknown>) => s.id !== payload.id) : data.servers;
      return { ...data, servers, totalCount: Math.max(0, ((data.totalCount as number | undefined) ?? 0) - 1) };
    });
  });

  /* ─── Backup ─── */

  sync.set('backup.started', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.backup.summary(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const backups = Array.isArray(data.backups) ? data.backups.map((b: Record<string, unknown>) =>
        b.id === payload.id ? { ...b, status: 'running', ...payload } : b
      ) : data.backups;
      return { ...data, backups };
    });
  });

  sync.set('backup.completed', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.backup.summary(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const backups = Array.isArray(data.backups) ? data.backups.map((b: Record<string, unknown>) =>
        b.id === payload.id ? { ...b, status: 'completed', ...payload } : b
      ) : data.backups;
      return { ...data, backups };
    });
  });

  sync.set('backup.failed', (client, event) => {
    const payload = event.payload as { id?: string; error?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.backup.summary(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const backups = Array.isArray(data.backups) ? data.backups.map((b: Record<string, unknown>) =>
        b.id === payload.id ? { ...b, status: 'failed', error: payload.error } : b
      ) : data.backups;
      return { ...data, backups };
    });
  });

  /* ─── Docker ─── */

  sync.set('container.started', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.docker.containers(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const containers = Array.isArray(data.containers) ? data.containers.map((c: Record<string, unknown>) =>
        c.id === payload.id ? { ...c, status: 'running', ...payload } : c
      ) : data.containers;
      return { ...data, containers, runningCount: ((data.runningCount as number | undefined) ?? 0) + 1, stoppedCount: Math.max(0, ((data.stoppedCount as number | undefined) ?? 0) - 1) };
    });
  });

  sync.set('container.stopped', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.docker.containers(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const containers = Array.isArray(data.containers) ? data.containers.map((c: Record<string, unknown>) =>
        c.id === payload.id ? { ...c, status: 'stopped', ...payload } : c
      ) : data.containers;
      return { ...data, containers, stoppedCount: ((data.stoppedCount as number | undefined) ?? 0) + 1, runningCount: Math.max(0, ((data.runningCount as number | undefined) ?? 0) - 1) };
    });
  });

  sync.set('container.updated', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.docker.containers(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const containers = Array.isArray(data.containers) ? data.containers.map((c: Record<string, unknown>) =>
        c.id === payload.id ? { ...c, ...payload } : c
      ) : data.containers;
      return { ...data, containers };
    });
  });

  /* ─── Tunnel ─── */

  sync.set('tunnel.connected', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.tunnel.overview() });
  });

  sync.set('tunnel.disconnected', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.tunnel.overview() });
  });

  /* ─── GitHub ─── */

  sync.set('workflow.started', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.github.workflows() });
  });

  sync.set('workflow.completed', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.github.workflows() });
  });

  /* ─── Plugin ─── */

  sync.set('plugin.installed', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.plugins.all });
  });

  sync.set('plugin.updated', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.plugins.all });
  });

  sync.set('plugin.removed', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.plugins.all });
  });

  /* ─── Security ─── */

  sync.set('security.alert', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.security.events() });
  });

  /* ─── Audit ─── */

  sync.set('audit.created', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.audit.records() });
  });

  /* ─── Session ─── */

  sync.set('session.created', (client) => {
    void client.invalidateQueries({ queryKey: queryKeys.sessions.all });
  });

  sync.set('session.expired', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.sessions.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const sessions = Array.isArray(data.sessions) ? data.sessions.map((s: Record<string, unknown>) =>
        s.id === payload.id ? { ...s, status: 'expired', ...payload } : s
      ) : data.sessions;
      return { ...data, sessions };
    });
  });

  sync.set('session.revoked', (client, event) => {
    const payload = event.payload as { id?: string } | undefined;
    if (!payload?.id) return;
    client.setQueryData(queryKeys.sessions.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      const data = old as Record<string, unknown>;
      const sessions = Array.isArray(data.sessions) ? data.sessions.map((s: Record<string, unknown>) =>
        s.id === payload.id ? { ...s, status: 'revoked', ...payload } : s
      ) : data.sessions;
      return { ...data, sessions };
    });
  });

  /* ─── Profile ─── */

  sync.set('profile.updated', (client, event) => {
    const payload = event.payload as Record<string, unknown> | undefined;
    if (!payload) return;
    client.setQueryData(queryKeys.profile.detail(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      return { ...(old as Record<string, unknown>), ...payload };
    });
  });

  /* ─── Settings ─── */

  sync.set('settings.updated', (client, event) => {
    const payload = event.payload as Record<string, unknown> | undefined;
    if (!payload) return;
    client.setQueryData(queryKeys.settings.list(), (old: unknown) => {
      if (!old || typeof old !== 'object') return old;
      return { ...(old as Record<string, unknown>), ...payload };
    });
  });

  return sync;
}
