import { apiClient } from '../api/client.js';

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Backend response from /auth/login
export interface BackendLoginData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

// Normalized login response used by the frontend
export interface LoginResult {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
}

export interface AuthSession {
  authenticated: boolean;
  user: { id: string; name: string; email: string; role: string } | null;
}

export const authRepository = {
  login: async (data: LoginRequest): Promise<LoginResult> => {
    // Backend only needs password — ignore username
    const res = await apiClient.post<BackendLoginData>('/auth/login', { password: data.password });
    const loginData = res.data;
    return {
      accessToken: loginData.accessToken,
      user: {
        id: loginData.user.id,
        name: loginData.user.name,
        email: loginData.user.email,
        role: loginData.user.role ?? 'user',
      },
    };
  },
  logout: () =>
    apiClient.post('/auth/logout'),
  refresh: () =>
    apiClient.post<BackendLoginData>('/auth/refresh'),
  getSession: () =>
    apiClient.get<AuthSession>('/auth/session'),
};
