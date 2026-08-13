import React, { useEffect } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useAcademyStore } from '../../../stores/academy.store';
import { useAuthStore } from '../../../stores/auth.store';
import { AuthSkeleton } from './AuthSkeleton';

interface Props {
  children?: React.ReactNode;
}

export const AcademyEnrollmentGuard: React.FC<Props> = ({ children }) => {
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const loadAcademyThemeByUuid = useAcademyStore((state) => state.loadAcademyThemeByUuid);
  const activeAcademy = useAcademyStore((state) => state.activeAcademy);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (academyUuid) {
      loadAcademyThemeByUuid(academyUuid);
    }
  }, [academyUuid, loadAcademyThemeByUuid]);

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (!academyUuid) {
    return <Navigate to="/404" replace />;
  }

  const academy = loadAcademyThemeByUuid(academyUuid);

  if (!academy && !activeAcademy) {
    return <Navigate to="/404" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
