import React, { useEffect, useState } from 'react';
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
  const fetchAcademies = useAcademyStore((state) => state.fetchAcademies);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const isAcademyLoading = useAcademyStore((state) => state.isLoading);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (academyUuid) {
        await fetchAcademies();
        if (isMounted) {
          loadAcademyThemeByUuid(academyUuid);
          setHasAttemptedFetch(true);
        }
      } else {
        if (isMounted) setHasAttemptedFetch(true);
      }
    }
    init();
    return () => { isMounted = false; };
  }, [academyUuid, fetchAcademies, loadAcademyThemeByUuid]);

  if (isAuthLoading || !hasAttemptedFetch || isAcademyLoading) {
    return <AuthSkeleton />;
  }

  if (!academyUuid) {
    return <Navigate to="/404" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
