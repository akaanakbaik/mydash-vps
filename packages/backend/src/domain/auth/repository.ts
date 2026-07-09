import type { Session, AuthSessionId } from './entities.js';

export interface SessionRepository {
  findById(id: AuthSessionId): Promise<Session | null>;
  findByToken(token: string): Promise<Session | null>;
  findByWorkspaceId(workspaceId: string): Promise<Session[]>;
  save(session: Session): Promise<void>;
  delete(id: AuthSessionId): Promise<void>;
  expireAll(userId: string): Promise<void>;
}
