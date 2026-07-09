import { apiClient } from '../api/client.js';

export interface SettingUpdate {
  id: string;
  value: string | boolean | number;
}

export interface SettingsResponse {
  categories: { id: string; label: string; icon: string }[];
  settings: { id: string; label: string; type: string; value: string | boolean | number; description: string; category: string; options?: { label: string; value: string }[] }[];
}

export const settingsRepository = {
  getAll: () =>
    apiClient.get<SettingsResponse>('/settings'),
  update: (updates: SettingUpdate[]) =>
    apiClient.patch('/settings', { updates }),
};
