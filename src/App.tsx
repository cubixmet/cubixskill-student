import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './features/auth/store/auth.store';

import { ToastContainer } from './components/ui/Toast';

export const App: React.FC = () => {
  useEffect(() => {
    // 1. Restore authenticated session on app start
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
