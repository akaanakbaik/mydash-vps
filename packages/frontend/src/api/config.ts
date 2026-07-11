export const API_CONFIG = {
  baseUrl: '/api/v1',
  defaultTimeout: 15000,
  retryCount: 3,
  retryDelay: 1000,
  retryStatuses: [408, 429, 500, 502, 503, 504],
} as const;
