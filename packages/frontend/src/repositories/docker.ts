import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';

export interface DockerContainer {
  id: string; name: string; image: string; status: string;
  cpuPercent: number; memoryPercent: number; ports: string; created: string;
}

export interface DockerImage { id: string; repository: string; tag: string; size: number; created: string; }
export interface DockerVolume { name: string; driver: string; mountPoint: string; size: number; status: string; }
export interface DockerNetwork { name: string; driver: string; subnet: string; containers: number; }

export interface DockerResponse {
  containers: DockerContainer[];
  images: DockerImage[];
  volumes: DockerVolume[];
  networks: DockerNetwork[];
  totalCpu: number;
  totalMemory: number;
  containerCount: number;
  runningCount: number;
  stoppedCount: number;
  timeline: { timestamp: string; cpu: number; memory: number }[];
}

export const dockerRepository = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<DockerResponse>('/docker', { params: params as Record<string, string | number | boolean | undefined> }),
  getContainers: (params?: PaginationParams) =>
    apiClient.get<DockerContainer[]>('/docker/containers', { params: params as Record<string, string | number | boolean | undefined> }),
  restartContainer: (id: string) =>
    apiClient.post(`/docker/containers/${id}/restart`),
};
