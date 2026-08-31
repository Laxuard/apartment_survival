import { apiClient } from '@/lib/api-client';
import type { LoginDto, RegisterDto, UserSummary } from '../types';

export const authApi = {
  login: async (dto: LoginDto): Promise<UserSummary> => {
    const { data } = await apiClient.post<UserSummary>('/auth/login', dto);
    return data;
  },

  register: async (dto: RegisterDto): Promise<UserSummary> => {
    const { data } = await apiClient.post<UserSummary>('/auth/register', dto);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async (): Promise<UserSummary> => {
    const { data } = await apiClient.get<UserSummary>('/me');
    return data;
  },

  updateProfile: async (dto: { username: string; email: string }): Promise<UserSummary> => {
    const { data } = await apiClient.put<UserSummary>('/me', dto);
    return data;
  },

  changePassword: async (dto: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.put('/me/password', dto);
  },
};
