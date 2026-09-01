import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { purgeLegacyStorage } from './lib/storageCleanup';
import App from './App.tsx';

// Purge legacy mock keys and obsolete stored state from localStorage
purgeLegacyStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
