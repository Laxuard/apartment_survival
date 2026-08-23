import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { AppProvider } from '@/app/providers/AppProvider';
import { useThemeStore } from '@/stores/useThemeStore';

const App: React.FC = () => {
  const mode = useThemeStore((state) => state.mode);

  // Synchronize data-mode attribute on body
  useEffect(() => {
    document.body.dataset.mode = mode;
  }, [mode]);

  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
};

export default App;
