export interface HealthScore {
  workspaceId: string;
  serverId: string;
  overall: number;
  grade: HealthGrade;
  confidence: number;
  trend: number;
  momentum: number;
  acceleration: number;
  domainScores: DomainScore[];
  factors: HealthFactor[];
  calculatedAt: string;
}
export enum HealthGrade {
  APlus = 'A+',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
}
export interface DomainScore {
  domain: HealthDomain;
  score: number;
  weight: number;
  confidence: number;
}
export enum HealthDomain {
  System = 'system',
  CPU = 'cpu',
  Memory = 'memory',
  Disk = 'disk',
  Filesystem = 'filesystem',
  Network = 'network',
  Tunnel = 'tunnel',
  Database = 'database',
  Redis = 'redis',
  Docker = 'docker',
  Automation = 'automation',
  Notification = 'notification',
  GitHub = 'github',
  Scheduler = 'scheduler',
  Security = 'security',
  Plugin = 'plugin',
  Backup = 'backup',
  AI = 'ai',
}
export interface HealthFactor {
  domain: HealthDomain;
  description: string;
  impact: number;
  penalty: number;
  bonus: number;
}
export interface HealthHistory {
  id: string;
  workspaceId: string;
  serverId: string;
  overall: number;
  grade: HealthGrade;
  confidence: number;
  domainScores: DomainScore[];
  calculatedAt: string;
}
