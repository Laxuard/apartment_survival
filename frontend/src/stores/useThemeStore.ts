import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const resolveMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
};

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
        document.body.dataset.mode = resolveMode(mode);
        set({ mode });
      },
    }),
    {
      name: 'apartment-survival-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.mode) {
          document.body.dataset.mode = resolveMode(state.mode);
        }
      },
    }
  )
);

