import type { HealthScoreRepository } from '../../domain/healthScore/index.js';
import type { HealthScore, HealthHistory } from '@mydash/shared';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { metrics } from '../../persistence/schema/monitoring.js';
import { eq, and, desc, gte } from 'drizzle-orm';

export class HealthScoreRepositoryImpl implements HealthScoreRepository {
  constructor(
    private readonly db: DrizzleClient,
  ) {
    this.db = makeTransactionalDb(this.db);
  }
  async save(score: HealthScore): Promise<void> {      const recordData: Record<string, unknown> = score as unknown as Record<string, unknown>;
    await this.db.insert(metrics).values({
      id: crypto.randomUUID(),
      workspaceId: score.workspaceId,
      serverId: score.serverId,
      metricType: 'health_score',
      data: recordData,
      correlationId: crypto.randomUUID(),
      version: 1,
    });
  }

  async findLatest(serverId: string): Promise<HealthScore | null> {
    const results = await this.db
      .select({ data: metrics.data })
      .from(metrics)
      .where(and(eq(metrics.serverId, serverId), eq(metrics.metricType, 'health_score')))
      .orderBy(desc(metrics.recordedAt))
      .limit(1);

    if (results.length === 0) return null;
    return results[0].data as HealthScore;
  }

  async findHistory(serverId: string, windowMs: number): Promise<HealthHistory[]> {
    const cutoff = new Date(Date.now() - windowMs);

    const results = await this.db
      .select({ data: metrics.data })
      .from(metrics)
      .where(
        and(eq(metrics.serverId, serverId), eq(metrics.metricType, 'health_score'), gte(metrics.recordedAt, cutoff)),
      )
      .orderBy(desc(metrics.recordedAt))
      .limit(200);

    return results.map((r: { data: unknown }) => {
      const hs = r.data as HealthScore;
      return {
        id: crypto.randomUUID(),
        workspaceId: hs.workspaceId,
        serverId: hs.serverId,
        overall: hs.overall,
        grade: hs.grade,
        confidence: hs.confidence,
        domainScores: hs.domainScores,
        calculatedAt: hs.calculatedAt,
      };
    });
  }
}
