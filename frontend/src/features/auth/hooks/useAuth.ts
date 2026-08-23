import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { LoginDto, RegisterDto } from '../types';
import { useAuthStore } from '@/stores/useAuthStore';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (userSummary) => {
      setAuth(
        {
          id: userSummary.userId,
          name: userSummary.username,
          email: userSummary.email,
        },
        'session-cookie-active'
      );
      queryClient.invalidateQueries({ queryKey: ['user', 'households'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    onSuccess: (userSummary) => {
      setAuth(
        {
          id: userSummary.userId,
          name: userSummary.username,
          email: userSummary.email,
        },
        'session-cookie-active'
      );
      queryClient.invalidateQueries({ queryKey: ['user', 'households'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};
