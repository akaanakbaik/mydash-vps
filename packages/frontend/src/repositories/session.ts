import { apiClient } from '../api/client.js';
export interface SessionRecord {
  id: string; name: string; type: string; ip: string; location: string;
  device: string; browser: string; os: string; created: string;
  lastActive: string; expiresAt: string; isCurrent: boolean;
  isTrusted: boolean; status: string;
}
export interface SessionResponse {
  summary: { totalSessions: number; activeSessions: number; expiredSessions: number; revokedSessions: number; webSessions: number; apiSessions: number; sshSessions: number; cliSessions: number; trustedDevices: number };
  sessions: SessionRecord[];
}
export const sessionRepository = {
  getAll: () =>
    apiClient.get<SessionResponse>('/sessions'),
  revoke: (id: string) =>
    apiClient.post(`/sessions/${id}/revoke`),
};
