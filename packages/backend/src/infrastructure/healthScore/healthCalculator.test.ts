import { describe, it, expect, vi } from 'vitest';
import { HealthScoreCalculator } from './healthCalculator.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { AnalyticsRepository } from '../../domain/analytics/index.js';
import type { Logger } from '../../logging/index.js';

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};

function createCalculator() {
  return new HealthScoreCalculator({} as MetricRepository, {} as AnalyticsRepository, mockLogger);
}

describe('HealthScoreCalculator', () => {
  describe('computeScores', () => {
    it('produces score between 0-100', () => {
      expect(createCalculator().computeScores({ cpu: 85, memory: 92, disk: 96, tunnel: 100, db: 75, automation: 98 })).toBeGreaterThanOrEqual(0);
    });
    it('returns 0 for empty', () => { expect(createCalculator().computeScores({})).toBe(0); });
    it('caps at 100', () => { expect(createCalculator().computeScores({ cpu: 200 })).toBeLessThanOrEqual(100); });
  });

  describe('getGrade', () => {
    it('A+ for 98+', () => { expect(createCalculator().getGrade(99)).toBe('A+'); });
    it('A for 93-97', () => { expect(createCalculator().getGrade(95)).toBe('A'); });
    it('B for 85-92', () => { expect(createCalculator().getGrade(88)).toBe('B'); });
    it('C for 75-84', () => { expect(createCalculator().getGrade(78)).toBe('C'); });
    it('D for 60-74', () => { expect(createCalculator().getGrade(65)).toBe('D'); });
    it('F for below 60', () => { expect(createCalculator().getGrade(50)).toBe('F'); });
  });

  describe('calculate', () => {
    it('returns HealthScore', async () => {
      const r = await createCalculator().calculate('srv-1', 'ws-1');
      expect(r.serverId).toBe('srv-1');
      expect(r.workspaceId).toBe('ws-1');
      expect(r.overall).toBeGreaterThanOrEqual(0);
      expect(r.domainScores.length).toBeGreaterThan(0);
      expect(r.calculatedAt).toBeDefined();
    });
  });

  describe('getDefaultWeights', () => {
    it('returns weights', () => {
      const w = createCalculator().getDefaultWeights();
      expect(w.cpu).toBeGreaterThan(0);
      expect(w.tunnel).toBeGreaterThan(0);
    });
  });
});
