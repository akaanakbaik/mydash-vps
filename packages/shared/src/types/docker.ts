export interface DockerContainer {
  id: string;
  workspaceId: string;
  serverId: string;
  containerId: string;
  name: string;
  image: string;
  tag: string;
  status: string;
  healthStatus: string;
  restartPolicy: string;
  restartCount: number;
  exitCode: number | null;
  cpuPercent: number;
  memoryBytes: number;
  diskBytes: number;
  networkRxBytes: number;
  networkTxBytes: number;
  ports: PortMapping[];
  mounts: MountPoint[];
  environmentKeys: string[];
  createdAt: string;
  startedAt: string | null;
}

export interface PortMapping {
  containerPort: number;
  hostPort: number;
  protocol: string;
}

export interface MountPoint {
  type: string;
  source: string;
  destination: string;
  readOnly: boolean;
}

export interface DockerCompose {
  id: string;
  workspaceId: string;
  serverId: string;
  projectName: string;
  serviceCount: number;
  containerIds: string[];
  status: string;
  createdAt: string;
}

export enum DockerAction {
  Start = 'start',
  Stop = 'stop',
  Restart = 'restart',
  Pause = 'pause',
  Resume = 'resume',
  Remove = 'remove',
  Pull = 'pull',
  Recreate = 'recreate',
}
