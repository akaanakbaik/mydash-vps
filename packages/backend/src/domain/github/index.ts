import type { GitHubRepository, GitHubWorkflow } from '@mydash/shared';
export type { GitHubRepository, GitHubWorkflow, GitHubCommit } from '@mydash/shared';
export { GitHubRepoStatus } from '@mydash/shared';
export interface GitHubDomainRepository {
  save(repo: GitHubRepository): Promise<void>;
  findById(id: string): Promise<GitHubRepository | null>;
  findByWorkspaceId(workspaceId: string): Promise<GitHubRepository[]>;
  saveWorkflow(workflow: GitHubWorkflow): Promise<void>;
  findWorkflows(repositoryId: string): Promise<GitHubWorkflow[]>;
}
