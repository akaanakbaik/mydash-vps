// Mock GitHub data provider.
export interface Repo { id: number; name: string; owner: string; description: string; language: string; stars: number; forks: number; issues: number; prs: number; branch: string; updatedAt: string; private: boolean; }
export interface Workflow { id: string; name: string; repo: string; status: 'success' | 'failed' | 'running' | 'pending' | 'cancelled'; branch: string; trigger: string; startedAt: string; duration: number; }
export interface Release { id: number; tag: string; name: string; prerelease: boolean; publishedAt: string; downloads: number; }
export interface Commit { sha: string; message: string; author: string; branch: string; timestamp: string; }
export interface Branch { name: string; protected: boolean; ahead: number; behind: number; lastCommit: string; }
export interface PullRequest { id: number; title: string; author: string; status: 'open' | 'merged' | 'closed' | 'draft'; branch: string; target: string; created: string; comments: number; }
export interface Issue { id: number; title: string; author: string; status: 'open' | 'closed'; labels: string[]; created: string; comments: number; }
export interface GitHubData { repos: Repo[]; workflows: Workflow[]; releases: Release[]; commits: Commit[]; branches: Branch[]; pullRequests: PullRequest[]; issues: Issue[]; connected: boolean; }
function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }
export function getMockGitHubData(): GitHubData { return {
  connected: true,
  repos: [
    { id: 1, name: 'mydash-vps', owner: 'akaanakbaik', description: 'VPS Dashboard with monitoring, analytics, and automation', language: 'TypeScript', stars: 128, forks: 32, issues: 8, prs: 3, branch: 'main', updatedAt: minutesAgo(60), private: false },
    { id: 2, name: 'mydash-agent', owner: 'akaanakbaik', description: 'System agent for My Dash VPS monitoring', language: 'Rust', stars: 42, forks: 12, issues: 4, prs: 1, branch: 'develop', updatedAt: minutesAgo(240), private: false },
    { id: 3, name: 'mydash-docs', owner: 'akaanakbaik', description: 'Documentation for My Dash VPS Dashboard', language: 'Markdown', stars: 15, forks: 8, issues: 2, prs: 0, branch: 'main', updatedAt: minutesAgo(720), private: false },
  ],
  workflows: [
    { id: 'w1', name: 'CI Build & Test', repo: 'mydash-vps', status: 'success', branch: 'main', trigger: 'push', startedAt: minutesAgo(60), duration: 420 },
    { id: 'w2', name: 'Lint & Typecheck', repo: 'mydash-vps', status: 'success', branch: 'main', trigger: 'pull_request', startedAt: minutesAgo(60), duration: 180 },
    { id: 'w3', name: 'Docker Build', repo: 'mydash-vps', status: 'running', branch: 'develop', trigger: 'push', startedAt: minutesAgo(5), duration: 0 },
    { id: 'w4', name: 'Release Draft', repo: 'mydash-vps', status: 'pending', branch: 'main', trigger: 'tag', startedAt: minutesAgo(1440), duration: 0 },
    { id: 'w5', name: 'Agent Build', repo: 'mydash-agent', status: 'failed', branch: 'develop', trigger: 'push', startedAt: minutesAgo(240), duration: 85 },
  ],
  releases: [
    { id: 1, tag: 'v1.2.0', name: 'Stable Release v1.2.0', prerelease: false, publishedAt: minutesAgo(4320), downloads: 1280 },
    { id: 2, tag: 'v1.1.0', name: 'Stable Release v1.1.0', prerelease: false, publishedAt: minutesAgo(21600), downloads: 2560 },
    { id: 3, tag: 'v1.3.0-beta', name: 'Beta v1.3.0', prerelease: true, publishedAt: minutesAgo(1440), downloads: 128 },
  ],
  commits: [
    { sha: 'a1b2c3d', message: 'feat: add realtime monitoring dashboard', author: 'developer1', branch: 'main', timestamp: minutesAgo(60) },
    { sha: 'e4f5g6h', message: 'fix: resolve memory leak in WebSocket handler', author: 'developer2', branch: 'main', timestamp: minutesAgo(120) },
    { sha: 'i7j8k9l', message: 'chore: update dependencies', author: 'developer1', branch: 'develop', timestamp: minutesAgo(180) },
    { sha: 'm0n1o2p', message: 'feat: add health score calculation engine', author: 'developer2', branch: 'develop', timestamp: minutesAgo(240) },
    { sha: 'q3r4s5t', message: 'docs: update API documentation', author: 'developer1', branch: 'main', timestamp: minutesAgo(360) },
  ],
  branches: [
    { name: 'main', protected: true, ahead: 2, behind: 0, lastCommit: minutesAgo(60) },
    { name: 'develop', protected: false, ahead: 5, behind: 2, lastCommit: minutesAgo(180) },
    { name: 'feature/realtime', protected: false, ahead: 8, behind: 5, lastCommit: minutesAgo(720) },
  ],
  pullRequests: [
    { id: 1, title: 'feat: realtime monitoring dashboard', author: 'developer2', status: 'open', branch: 'feature/realtime', target: 'develop', created: minutesAgo(1440), comments: 12 },
    { id: 2, title: 'fix: websocket reconnection logic', author: 'developer1', status: 'merged', branch: 'fix/ws-reconnect', target: 'main', created: minutesAgo(2880), comments: 5 },
    { id: 3, title: 'chore: upgrade to React 19', author: 'developer2', status: 'draft', branch: 'chore/react19', target: 'develop', created: minutesAgo(720), comments: 3 },
  ],
  issues: [
    { id: 1, title: 'Memory usage increases over time', author: 'user1', status: 'open', labels: ['bug', 'performance'], created: minutesAgo(4320), comments: 8 },
    { id: 2, title: 'Add dark mode toggle', author: 'user2', status: 'open', labels: ['enhancement'], created: minutesAgo(2160), comments: 4 },
    { id: 3, title: 'Tunnel reconnection fails silently', author: 'user1', status: 'closed', labels: ['bug', 'fixed'], created: minutesAgo(10080), comments: 6 },
  ],
}; }
