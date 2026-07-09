// Mock Docker data provider — replace with real Docker Engine later.
export interface DockerContainer { id: string; name: string; image: string; status: 'running' | 'stopped' | 'exited' | 'paused'; cpuPercent: number; memoryPercent: number; memoryUsage: number; memoryLimit: number; restartCount: number; ports: string; created: string; composeStack?: string; }
export interface DockerImage { id: string; repository: string; tag: string; size: number; created: string; containers: number; }
export interface DockerVolume { name: string; driver: string; mountPoint: string; size: number; status: string; }
export interface DockerNetwork { name: string; driver: string; subnet: string; gateway: string; containers: number; }
export interface DockerComposeStack { name: string; containers: number; status: 'running' | 'partial' | 'stopped'; }
export interface DockerTimelinePoint { timestamp: string; cpu: number; memory: number; }
export interface DockerData { containers: DockerContainer[]; images: DockerImage[]; volumes: DockerVolume[]; networks: DockerNetwork[]; composeStacks: DockerComposeStack[]; totalCpu: number; totalMemory: number; containerCount: number; runningCount: number; stoppedCount: number; timeline: DockerTimelinePoint[]; }
function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }
export function getMockDockerData(): DockerData { return {
  containers: [
    { id: 'c1', name: 'nginx-proxy', image: 'nginx:1.25', status: 'running', cpuPercent: 2.4, memoryPercent: 8, memoryUsage: 128, memoryLimit: 1024, restartCount: 1, ports: '80,443', created: minutesAgo(43200), composeStack: 'web-stack' },
    { id: 'c2', name: 'postgres-db', image: 'postgres:16', status: 'running', cpuPercent: 8.1, memoryPercent: 32, memoryUsage: 512, memoryLimit: 2048, restartCount: 0, ports: '5432', created: minutesAgo(43200), composeStack: 'web-stack' },
    { id: 'c3', name: 'redis-cache', image: 'redis:7-alpine', status: 'running', cpuPercent: 1.2, memoryPercent: 6, memoryUsage: 64, memoryLimit: 512, restartCount: 2, ports: '6379', created: minutesAgo(43200), composeStack: 'web-stack' },
    { id: 'c4', name: 'my-dash-agent', image: 'mydash/agent:latest', status: 'running', cpuPercent: 3.5, memoryPercent: 16, memoryUsage: 256, memoryLimit: 512, restartCount: 0, ports: '9001', created: minutesAgo(43200) },
    { id: 'c5', name: 'prometheus', image: 'prom/prometheus:latest', status: 'stopped', cpuPercent: 0, memoryPercent: 0, memoryUsage: 0, memoryLimit: 1024, restartCount: 3, ports: '9090', created: minutesAgo(28800) },
    { id: 'c6', name: 'grafana', image: 'grafana/grafana:latest', status: 'running', cpuPercent: 5.2, memoryPercent: 24, memoryUsage: 384, memoryLimit: 1024, restartCount: 0, ports: '3000', created: minutesAgo(28800) },
    { id: 'c7', name: 'redis-session', image: 'redis:7-alpine', status: 'exited', cpuPercent: 0, memoryPercent: 0, memoryUsage: 0, memoryLimit: 256, restartCount: 5, ports: '6380', created: minutesAgo(1440) },
  ],
  images: [
    { id: 'i1', repository: 'nginx', tag: '1.25', size: 187, created: minutesAgo(43200), containers: 1 },
    { id: 'i2', repository: 'postgres', tag: '16', size: 412, created: minutesAgo(43200), containers: 1 },
    { id: 'i3', repository: 'redis', tag: '7-alpine', size: 32, created: minutesAgo(43200), containers: 2 },
    { id: 'i4', repository: 'mydash/agent', tag: 'latest', size: 128, created: minutesAgo(43200), containers: 1 },
    { id: 'i5', repository: 'prom/prometheus', tag: 'latest', size: 245, created: minutesAgo(28800), containers: 1 },
    { id: 'i6', repository: 'grafana/grafana', tag: 'latest', size: 380, created: minutesAgo(28800), containers: 1 },
  ],
  volumes: [
    { name: 'pgdata', driver: 'local', mountPoint: '/var/lib/docker/volumes/pgdata', size: 5120, status: 'in-use' },
    { name: 'redis-data', driver: 'local', mountPoint: '/var/lib/docker/volumes/redis-data', size: 256, status: 'in-use' },
    { name: 'grafana-storage', driver: 'local', mountPoint: '/var/lib/docker/volumes/grafana-storage', size: 1024, status: 'in-use' },
    { name: 'prometheus-data', driver: 'local', mountPoint: '/var/lib/docker/volumes/prometheus-data', size: 51200, status: 'unused' },
  ],
  networks: [
    { name: 'web-network', driver: 'bridge', subnet: '172.18.0.0/16', gateway: '172.18.0.1', containers: 3 },
    { name: 'db-network', driver: 'bridge', subnet: '172.19.0.0/16', gateway: '172.19.0.1', containers: 2 },
    { name: 'monitoring', driver: 'bridge', subnet: '172.20.0.0/16', gateway: '172.20.0.1', containers: 2 },
  ],
  composeStacks: [
    { name: 'web-stack', containers: 3, status: 'running' },
    { name: 'monitoring-stack', containers: 2, status: 'partial' },
  ],
  totalCpu: 20.4, totalMemory: 65.6, containerCount: 7, runningCount: 5, stoppedCount: 1, timeline: Array.from({ length: 24 }).map((_, i) => ({ timestamp: minutesAgo(24 - i), cpu: 15 + Math.sin(i * 0.5) * 8 + Math.random() * 5, memory: 55 + Math.sin(i * 0.3) * 10 + Math.random() * 5 })),
}; }
