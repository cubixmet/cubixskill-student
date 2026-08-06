import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { AuthSkeleton } from './AuthSkeleton';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setIntendedRoute = useAuthStore((state) => state.setIntendedRoute);
  const location = useLocation();

  const fullPath = location.pathname + location.search;

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setIntendedRoute(fullPath);
    }
  }, [isAuthenticated, isLoading, fullPath, setIntendedRoute]);

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: fullPath }}
        replace
      />
    );
  }

  return <>{children}</>;
};
