import { useAuthStore } from '@/stores/useAuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authApi } from '../api/authApi';
import type { LoginDto, RegisterDto } from '../types';

export const useCurrentUserQuery = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const logout = useAuthStore((s) => s.logout);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      return await authApi.getProfile();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setAuth({
        id: query.data.userId,
        name: query.data.username,
        email: query.data.email,
      });
    } else if (query.isError) {
      logout();
    } else if (!query.isLoading) {
      setInitialized(true);
    }
  }, [query.isSuccess, query.isError, query.isLoading, query.data, setAuth, logout, setInitialized]);

  return query;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (userSummary) => {
      setAuth({
        id: userSummary.userId,
        name: userSummary.username,
        email: userSummary.email,
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    onSuccess: (userSummary) => {
      setAuth({
        id: userSummary.userId,
        name: userSummary.username,
        email: userSummary.email,
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['households'] });
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
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (dto: { username: string; email: string }) => authApi.updateProfile(dto),
    onSuccess: (updated) => {
      updateUser({
        name: updated.username,
        email: updated.email,
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (dto: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(dto),
  });
};
