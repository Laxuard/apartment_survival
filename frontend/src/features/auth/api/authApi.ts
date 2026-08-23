import { apiClient } from '@/lib/api-client';
import type { UserSummary, LoginDto, RegisterDto } from '../types';

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
};
