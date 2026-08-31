import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { AuthSkeleton } from './AuthSkeleton';

export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { academyUuid } = useParams<{ academyUuid?: string }>();

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (isAuthenticated) {
    const targetUrl = academyUuid ? `/student/academies/${academyUuid}` : '/student/academies';
    return <Navigate to={targetUrl} replace />;
  }

  return <>{children}</>;
};
