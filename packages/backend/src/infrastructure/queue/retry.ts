export interface RetryPolicy {
  shouldRetry(attempt: number, error: Error): boolean;
  getDelayMs(attempt: number): number;
  getMaxRetries(): number;
}

export function createExponentialBackoff(
  baseDelayMs: number,
  maxRetries: number,
  jitter: boolean = true,
): RetryPolicy {
  return {
    shouldRetry(attempt: number, _error: Error): boolean {
      return attempt < maxRetries;
    },
    getDelayMs(attempt: number): number {
      const delay = baseDelayMs * Math.pow(2, attempt);
      if (jitter) {
        const jitterRange = delay * 0.15;
        return delay + (Math.random() * jitterRange * 2 - jitterRange);
      }
      return delay;
    },
    getMaxRetries(): number {
      return maxRetries;
    },
  };
}
