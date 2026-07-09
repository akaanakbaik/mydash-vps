export { cn } from './cn.js';
export { theme } from './tokens.js';

/** Safely convert unknown to string, returns fallback for non-primitive values */
export function safeStr(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return fallback;
}
