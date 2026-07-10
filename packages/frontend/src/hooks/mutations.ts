import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys.js';
import { authRepository, type LoginRequest } from '../repositories/auth.js';
import { tokenStorage } from '../utils/tokenStorage.js';
import { backupRepository } from '../repositories/backup.js';
import { dockerRepository } from '../repositories/docker.js';
import { sessionRepository } from '../repositories/session.js';
import { pluginRepository } from '../repositories/plugin.js';
import { settingsRepository, type SettingUpdate } from '../repositories/settings.js';
import { profileRepository } from '../repositories/profile.js';
import { automationRepository } from '../repositories/automation.js';

/* ─────────── Auth Mutations ─────────── */

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => authRepository.login(data),
    onSuccess: (result) => {
      // Store JWT token for auth interceptor
      tokenStorage.setToken(result.accessToken);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/* ─────────── Backup Mutations ─────────── */

export function useTriggerBackupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: string) => backupRepository.triggerBackup(type),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.backup.all });
    },
  });
}

export function useRestoreBackupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => backupRepository.restore(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.backup.all });
    },
  });
}

/* ─────────── Docker Mutations ─────────── */

export function useRestartContainerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dockerRepository.restartContainer(id),
    onMutate: async (containerId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.docker.all });
      const previous = queryClient.getQueryData(queryKeys.docker.containers());
      queryClient.setQueryData(queryKeys.docker.containers(), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = old as Record<string, unknown>;
        const containers = Array.isArray(data.containers) ? data.containers.map((c: Record<string, unknown>) =>
          c.id === containerId ? { ...c, status: 'restarting' } : c
        ) : data.containers;
        return { ...data, containers };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.docker.all });
      }
    },
  });
}

/* ─────────── Session Mutations ─────────── */

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionRepository.revoke(id),
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.all });
      const previous = queryClient.getQueryData(queryKeys.sessions.list());
      queryClient.setQueryData(queryKeys.sessions.list(), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = old as Record<string, unknown>;
        const sessions = Array.isArray(data.sessions) ? data.sessions.map((s: Record<string, unknown>) =>
          s.id === sessionId ? { ...s, status: 'revoked' } : s
        ) : data.sessions;
        return { ...data, sessions };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.sessions.list(), context.previous);
      }
    },
  });
}

/* ─────────── Plugin Mutations ─────────── */

export function useInstallPluginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pluginRepository.install(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all });
    },
  });
}

export function useUninstallPluginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pluginRepository.uninstall(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all });
    },
  });
}

/* ─────────── Settings Mutations ─────────── */

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: SettingUpdate[]) => settingsRepository.update(updates),
    onMutate: async (_updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.all });
      const previous = queryClient.getQueryData(queryKeys.settings.list());
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.list(), context.previous);
      }
    },
  });
}

/* ─────────── Profile Mutations ─────────── */

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => profileRepository.update(data as Record<string, string | boolean | number>),
    onMutate: async (profileData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.all });
      const previous = queryClient.getQueryData(queryKeys.profile.detail());
      queryClient.setQueryData(queryKeys.profile.detail(), (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        return { ...(old as Record<string, unknown>), ...profileData };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.profile.detail(), context.previous);
      }
    },
  });
}

/* ─────────── Automation Mutations ─────────── */

export function useTriggerWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automationRepository.triggerWorkflow(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.automation.all });
    },
  });
}
