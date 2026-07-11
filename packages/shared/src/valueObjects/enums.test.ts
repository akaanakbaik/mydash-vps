import { describe, it, expect } from 'vitest';
describe('Enums - Category', () => {
  enum Category {
    System = 'system',
    Performance = 'performance',
    Security = 'security',
    Storage = 'storage',
    Network = 'network',
  }
  it('has expected system category', () => {
    expect(Category.System).toBe('system');
    expect(Category.Performance).toBe('performance');
    expect(Category.Security).toBe('security');
  });
  it('can be used as object keys', () => {
    const counts: Record<string, number> = {};
    counts[Category.System] = 5;
    counts[Category.Security] = 3;
    expect(counts.system).toBe(5);
    expect(counts.security).toBe(3);
  });
});
describe('Enums - Severity', () => {
  enum Severity {
    Information = 'information',
    Warning = 'warning',
    Error = 'error',
    Critical = 'critical',
  }
  it('has expected severity levels', () => {
    expect(Severity.Information).toBe('information');
    expect(Severity.Warning).toBe('warning');
    expect(Severity.Error).toBe('error');
    expect(Severity.Critical).toBe('critical');
  });
  it('can be compared for severity ordering', () => {
    const order = [Severity.Information, Severity.Warning, Severity.Error, Severity.Critical];
    expect(order.indexOf(Severity.Critical)).toBeGreaterThan(order.indexOf(Severity.Warning));
  });
});
