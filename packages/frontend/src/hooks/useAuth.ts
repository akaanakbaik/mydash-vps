import { useMutation } from '@tanstack/react-query';
import { authRepository, type LoginRequest } from '../repositories/auth.js';
import { tokenStorage } from '../utils/tokenStorage.js';
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authRepository.login(data),
    onSuccess: (result) => {
      tokenStorage.setToken(result.accessToken);
    },
  });
}
export function useLogout() {
  return useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      tokenStorage.clearToken();
    },
  });
}
