import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setAuth: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (user) =>
    set({ user, isAuthenticated: true, isInitialized: true }),

  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  logout: () =>
    set({ user: null, isAuthenticated: false, isInitialized: true }),

  setInitialized: (isInitialized) => set({ isInitialized }),
}));
