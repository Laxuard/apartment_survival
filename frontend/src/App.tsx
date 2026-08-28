import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { AppProvider } from '@/app/providers/AppProvider';
import { useThemeStore } from '@/stores/useThemeStore';

const App: React.FC = () => {
  const mode = useThemeStore((state) => state.mode);

  // Synchronize dynamic light/dark/system theme to body & root HTML
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      const activeTheme = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-mode', activeTheme);
      document.body.dataset.mode = activeTheme;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(mode === 'dark');
    }
  }, [mode]);

  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
};

export default App;
