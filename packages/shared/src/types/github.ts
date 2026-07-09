export interface GitHubRepository {
  id: string;
  workspaceId: string;
  name: string;
  fullName: string;
  cloneUrl: string;
  defaultBranch: string;
  currentBranch: string;
  isPrivate: boolean;
  status: GitHubRepoStatus;
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
}

export enum GitHubRepoStatus {
  NotConfigured = 'notConfigured',
  Connected = 'connected',
  Authenticating = 'authenticating',
  AuthFailed = 'authFailed',
  Syncing = 'syncing',
  Error = 'error',
}

export interface GitHubWorkflow {
  id: string;
  repositoryId: string;
  workflowId: string;
  name: string;
  path: string;
  state: string;
  status: string;
  conclusion: string | null;
  runNumber: number;
  event: string;
  branch: string;
  commitSha: string;
  durationMs: number;
  startedAt: string;
  completedAt: string | null;
  url: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}
