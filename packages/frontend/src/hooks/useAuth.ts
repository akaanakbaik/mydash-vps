import { useMutation } from '@tanstack/react-query';
import { authRepository, type LoginRequest } from '../repositories/auth.js';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authRepository.login(data).then((res) => res.data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authRepository.logout(),
  });
}
