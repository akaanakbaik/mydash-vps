import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { dockerContainers, dockerComposes } from '../../persistence/schema/docker.js';
import type { DockerRepository } from '../../domain/docker/index.js';
import type { DockerContainer, DockerCompose } from '@mydash/shared';

export class DockerRepositoryImpl implements DockerRepository {
  private readonly db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }

  async findById(id: string): Promise<DockerContainer | null> {
    const rows = await this.db.select().from(dockerContainers).where(eq(dockerContainers.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as DockerContainer;
  }

  async findByServerId(serverId: string): Promise<DockerContainer[]> {
    const rows = await this.db.select().from(dockerContainers).where(eq(dockerContainers.serverId, serverId));
    return rows as unknown as DockerContainer[];
  }

  async save(container: DockerContainer): Promise<void> {
    await this.db.insert(dockerContainers).values({
      id: container.id,
      workspaceId: container.workspaceId,
      serverId: container.serverId,
      containerId: container.containerId,
      name: container.name,
      image: container.image,
      status: container.status,
      healthStatus: container.healthStatus,
      ports: container.ports,
      mounts: container.mounts,
      restartCount: container.restartCount,
      startedAt: container.startedAt ? new Date(container.startedAt) : null,
    }).onConflictDoUpdate({
      target: dockerContainers.id,
      set: { status: container.status },
    });
  }

  async saveCompose(compose: DockerCompose): Promise<void> {
    await this.db.insert(dockerComposes).values({
      id: compose.id,
      workspaceId: compose.workspaceId,
      serverId: compose.serverId,
      name: compose.projectName,
      serviceCount: compose.serviceCount,
      status: compose.status,
    }).onConflictDoUpdate({
      target: dockerComposes.id,
      set: { status: compose.status },
    });
  }

  async findByComposeServerId(serverId: string): Promise<DockerCompose[]> {
    const rows = await this.db.select().from(dockerComposes).where(eq(dockerComposes.serverId, serverId));
    return rows as unknown as DockerCompose[];
  }
}
