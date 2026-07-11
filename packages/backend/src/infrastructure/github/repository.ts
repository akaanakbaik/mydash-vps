import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { githubRepos, githubWorkflows } from '../../persistence/schema/github.js';
import type { GitHubDomainRepository } from '../../domain/github/index.js';
import type { GitHubRepository, GitHubWorkflow } from '@mydash/shared';
export class GitHubDomainRepositoryImpl implements GitHubDomainRepository {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }
  async save(repo: GitHubRepository): Promise<void> {
    await this.db.insert(githubRepos).values({
      id: repo.id,
      workspaceId: repo.workspaceId,
      name: repo.name,
      fullName: repo.fullName,
      defaultBranch: repo.defaultBranch,
      url: repo.cloneUrl,
      language: null as string | null,
      stars: 0,
      lastSyncedAt: repo.lastSyncAt ? new Date(repo.lastSyncAt) : null,
    }).onConflictDoUpdate({
      target: githubRepos.id,
      set: { name: repo.name },
    });
  }
  async findById(id: string): Promise<GitHubRepository | null> {
    const rows = await this.db.select().from(githubRepos).where(eq(githubRepos.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as GitHubRepository;
  }
  async findByWorkspaceId(workspaceId: string): Promise<GitHubRepository[]> {
    const rows = await this.db.select().from(githubRepos).where(eq(githubRepos.workspaceId, workspaceId));
    return rows as unknown as GitHubRepository[];
  }
  async saveWorkflow(workflow: GitHubWorkflow): Promise<void> {
    await this.db.insert(githubWorkflows).values({
      id: workflow.id,
      repositoryId: workflow.repositoryId,
      name: workflow.name,
      path: workflow.path,
      status: workflow.status,
      conclusion: workflow.conclusion,
      runId: String(workflow.runNumber),
      startedAt: workflow.startedAt ? new Date(workflow.startedAt) : null,
      completedAt: workflow.completedAt ? new Date(workflow.completedAt) : null,
    }).onConflictDoUpdate({
      target: githubWorkflows.id,
      set: { status: workflow.status },
    });
  }
  async findWorkflows(repositoryId: string): Promise<GitHubWorkflow[]> {
    const rows = await this.db.select().from(githubWorkflows).where(eq(githubWorkflows.repositoryId, repositoryId));
    return rows as unknown as GitHubWorkflow[];
  }
}
