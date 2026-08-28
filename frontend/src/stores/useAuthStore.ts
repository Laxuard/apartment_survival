import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { MOCK_CURRENT_USER } from '@/mocks';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: MOCK_CURRENT_USER,
      token: 'mock-jwt-token',
      isAuthenticated: true,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'apartment-survival-auth',
    }
  )
);
