import { apiClient } from '../api/client.js';

export interface ProfileData {
  id: string; username: string; email: string; fullName: string;
  avatarUrl: string; role: string; department: string; location: string;
  bio: string; joinDate: string; lastActive: string;
  twoFactorEnabled: boolean; emailVerified: boolean; phoneNumber: string;
  apiKeys: { id: string; name: string; key: string; created: string; lastUsed: string }[];
  devices: { id: string; name: string; type: string; os: string; browser: string; lastActive: string; isCurrent: boolean }[];
  recentActivity: { id: string; action: string; timestamp: string; ip: string; location: string }[];
  securityInfo: { passwordLastChanged: string; mfaMethod: string; trustedDevices: number; activeSessions: number };
  accountInfo: { storageUsed: number; storageLimit: number; projectsCount: number; apiCalls: number; apiLimit: number };
}

export const profileRepository = {
  get: () =>
    apiClient.get<ProfileData>('/profile'),
  update: (data: Partial<ProfileData>) =>
    apiClient.patch<ProfileData>('/profile', data),
};
