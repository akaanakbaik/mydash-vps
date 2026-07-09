export const queryKeys = {
  overview: {
    all: ['overview'] as const,
    detail: () => ['overview', 'detail'] as const,
  },
  servers: {
    all: ['servers'] as const,
    list: (params?: Record<string, unknown>) => ['servers', 'list', params] as const,
    detail: (id: string) => ['servers', id] as const,
  },
  monitoring: {
    all: ['monitoring'] as const,
    metrics: (params?: Record<string, unknown>) => ['monitoring', 'metrics', params] as const,
    timeline: (params?: Record<string, unknown>) => ['monitoring', 'timeline', params] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    summary: () => ['analytics', 'summary'] as const,
    trends: (params?: Record<string, unknown>) => ['analytics', 'trends', params] as const,
    anomalies: () => ['analytics', 'anomalies'] as const,
  },
  health: {
    all: ['health'] as const,
    score: () => ['health', 'score'] as const,
    history: (params?: Record<string, unknown>) => ['health', 'history', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
    rules: () => ['notifications', 'rules'] as const,
    providers: () => ['notifications', 'providers'] as const,
  },
  automation: {
    all: ['automation'] as const,
    list: (params?: Record<string, unknown>) => ['automation', 'list', params] as const,
    workflows: () => ['automation', 'workflows'] as const,
    executions: (params?: Record<string, unknown>) => ['automation', 'executions', params] as const,
  },
  backup: {
    all: ['backup'] as const,
    summary: () => ['backup', 'summary'] as const,
    history: (params?: Record<string, unknown>) => ['backup', 'history', params] as const,
    restores: () => ['backup', 'restores'] as const,
  },
  docker: {
    all: ['docker'] as const,
    containers: (params?: Record<string, unknown>) => ['docker', 'containers', params] as const,
    images: () => ['docker', 'images'] as const,
    volumes: () => ['docker', 'volumes'] as const,
    networks: () => ['docker', 'networks'] as const,
  },
  tunnel: {
    all: ['tunnel'] as const,
    overview: () => ['tunnel', 'overview'] as const,
    sessions: (params?: Record<string, unknown>) => ['tunnel', 'sessions', params] as const,
  },
  github: {
    all: ['github'] as const,
    repositories: () => ['github', 'repositories'] as const,
    workflows: () => ['github', 'workflows'] as const,
    commits: () => ['github', 'commits'] as const,
  },
  plugins: {
    all: ['plugins'] as const,
    list: (params?: Record<string, unknown>) => ['plugins', 'list', params] as const,
    marketplace: () => ['plugins', 'marketplace'] as const,
  },
  security: {
    all: ['security'] as const,
    overview: () => ['security', 'overview'] as const,
    events: (params?: Record<string, unknown>) => ['security', 'events', params] as const,
    threats: () => ['security', 'threats'] as const,
  },
  audit: {
    all: ['audit'] as const,
    records: (params?: Record<string, unknown>) => ['audit', 'records', params] as const,
    summary: () => ['audit', 'summary'] as const,
  },
  settings: {
    all: ['settings'] as const,
    list: () => ['settings', 'list'] as const,
  },
  auth: {
    all: ['auth'] as const,
    session: () => ['auth', 'session'] as const,
  },
  profile: {
    all: ['profile'] as const,
    detail: () => ['profile', 'detail'] as const,
    activity: () => ['profile', 'activity'] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    list: () => ['sessions', 'list'] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: () => ['roles', 'list'] as const,
    detail: (id: string) => ['roles', id] as const,
  },
} as const;
