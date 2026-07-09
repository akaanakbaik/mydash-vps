import type { UseCase } from './base.js';
import type { Workspace } from '@mydash/shared';
import type { WorkspaceCreateDTO } from '../dto/index.js';

export interface CreateWorkspaceUseCase extends UseCase<WorkspaceCreateDTO, Workspace> {}
export interface GetWorkspaceUseCase extends UseCase<string, Workspace | null> {}
export interface ListWorkspacesUseCase extends UseCase<void, Workspace[]> {}
export interface DeleteWorkspaceUseCase extends UseCase<string, void> {}
