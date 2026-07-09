import { apiClient } from '../api/client.js';

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: { id: string; username: string; email: string; role: string };
  expiresAt: string;
}

export interface AuthSession {
  authenticated: boolean;
  user: { id: string; username: string; email: string; role: string } | null;
}

export const authRepository = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),
  logout: () =>
    apiClient.post('/auth/logout'),
  refresh: () =>
    apiClient.post<LoginResponse>('/auth/refresh'),
  getSession: () =>
    apiClient.get<AuthSession>('/auth/session'),
};
