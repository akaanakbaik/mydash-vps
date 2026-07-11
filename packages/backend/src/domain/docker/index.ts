import type { DockerContainer, DockerCompose } from '@mydash/shared';
export type { DockerContainer, DockerCompose, PortMapping, MountPoint } from '@mydash/shared';
export { DockerAction } from '@mydash/shared';
export interface DockerRepository {
  findById(id: string): Promise<DockerContainer | null>;
  findByServerId(serverId: string): Promise<DockerContainer[]>;
  save(container: DockerContainer): Promise<void>;
  saveCompose(compose: DockerCompose): Promise<void>;
  findByComposeServerId(serverId: string): Promise<DockerCompose[]>;
}
