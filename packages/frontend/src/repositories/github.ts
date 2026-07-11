import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';
export interface RepoData {
  id: number; name: string; owner: string; description: string;
  language: string; stars: number; forks: number; issues: number; prs: number;
  branch: string; updatedAt: string; private: boolean;
}
export interface WorkflowData {
  id: string; name: string; repo: string; status: string;
  branch: string; trigger: string; startedAt: string; duration: number;
}
export interface CommitData {
  sha: string; message: string; author: string; branch: string; timestamp: string;
}
export interface BranchData {
  name: string; protected: boolean; ahead: number; behind: number; lastCommit: string;
}
export interface GitHubResponse {
  repos: RepoData[];
  workflows: WorkflowData[];
  commits: CommitData[];
  branches: BranchData[];
  connected: boolean;
}
export const githubRepository = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<GitHubResponse>('/github', { params: params as Record<string, string | number | boolean | undefined> }),
  getWorkflows: () =>
    apiClient.get<WorkflowData[]>('/github/workflows'),
};
