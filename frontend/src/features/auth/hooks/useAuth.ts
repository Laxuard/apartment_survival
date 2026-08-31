import { useAuthStore } from '@/stores/useAuthStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginDto, RegisterDto } from '../types';

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

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      window.location.href = '/';
    },
  });
};

export const useUpdateProfile = () => {
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (dto: { username: string; email: string }) => authApi.updateProfile(dto),
    onSuccess: (updated) => {
      updateUser({
        name: updated.username,
        email: updated.email,
      });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (dto: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(dto),
  });
};
