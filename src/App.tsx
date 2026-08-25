import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './features/auth/store/auth.store';
import { useThemeStore } from './stores/theme.store';
import { clearTokens } from './services/apiClient';

import { ToastContainer } from './components/ui/Toast';

export const App: React.FC = () => {
  useEffect(() => {
    // 0. Purge legacy browser token storage keys if any exist
    clearTokens();

    // 1. Initialize Light/Dark/System theme store
    useThemeStore.getState().initTheme();

    // 2. Restore authenticated session on app start
    useAuthStore.getState().restoreSession();

    // 2. Multi-tab session synchronization event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'cubixskill_student_logout_event' ||
        e.key === 'cubixskill_student_session_active'
      ) {
        useAuthStore.getState().restoreSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
};

export default App;
