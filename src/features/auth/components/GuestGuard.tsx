import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { AuthSkeleton } from './AuthSkeleton';

export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (isAuthenticated) {
    return <Navigate to="/student/academies" replace />;
  }

  return <>{children}</>;
};
