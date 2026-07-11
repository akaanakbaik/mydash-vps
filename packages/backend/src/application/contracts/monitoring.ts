import type { Result, CpuMetric, MemoryMetric, DiskMetric, NetworkMetric, DockerMetric, TunnelMetric, ServiceMetric } from '@mydash/shared';
import type { AppError } from '@mydash/shared';
export interface MonitoringService {
  ingestMetric(metric: MonitoringMetric): Promise<Result<void, AppError>>;
  getLatestCpu(serverId: string): Promise<Result<CpuMetric | null, AppError>>;
  getLatestMemory(serverId: string): Promise<Result<MemoryMetric | null, AppError>>;
  getLatestDisk(serverId: string): Promise<Result<DiskMetric | null, AppError>>;
  getLatestNetwork(serverId: string): Promise<Result<NetworkMetric | null, AppError>>;
  getLatestDocker(serverId: string): Promise<Result<DockerMetric[], AppError>>;
  getLatestTunnel(serverId: string): Promise<Result<TunnelMetric | null, AppError>>;
}
export type MonitoringMetric =
  | { metricType: 'cpu'; data: CpuMetric }
  | { metricType: 'memory'; data: MemoryMetric }
  | { metricType: 'disk'; data: DiskMetric }
  | { metricType: 'network'; data: NetworkMetric }
  | { metricType: 'docker'; data: DockerMetric }
  | { metricType: 'tunnel'; data: TunnelMetric }
  | { metricType: 'service'; data: ServiceMetric };
