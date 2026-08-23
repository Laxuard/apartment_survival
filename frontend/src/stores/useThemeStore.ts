import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleMode: () =>
        set((state) => {
          const next = state.mode === 'light' ? 'dark' : 'light';
          document.body.dataset.mode = next;
          return { mode: next };
        }),
      setMode: (mode) => {
        document.body.dataset.mode = mode;
        set({ mode });
      },
    }),
    {
      name: 'apartment-survival-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.mode) {
          document.body.dataset.mode = state.mode;
        }
      },
    }
  )
);
