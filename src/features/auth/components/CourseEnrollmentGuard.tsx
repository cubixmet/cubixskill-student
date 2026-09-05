import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { AuthSkeleton } from './AuthSkeleton';
import { useAuthStore } from '../../../stores/auth.store';
import { studentPortalService } from '../../../services/studentPortal.service';
import { isValidUuid } from '../../../utils/routeBuilder';

interface Props {
  children?: React.ReactNode;
}

export const CourseEnrollmentGuard: React.FC<Props> = ({ children }) => {
  const { academyUuid, courseUuid } = useParams<{ academyUuid: string; courseUuid: string }>();
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied' | 'error'>('loading');

  useEffect(() => {
    let mounted = true;

    async function verifyAccess() {
      if (isAuthLoading) return;

      if (!isAuthenticated || !isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
        if (mounted) setStatus('denied');
        return;
      }

      try {
        const res = await studentPortalService.getCourseLearnBootstrap(academyUuid!, courseUuid!);
        if (res && (res.course || res.curriculum || res.lessons || res.academy)) {
          if (mounted) setStatus('allowed');
        } else {
          if (mounted) setStatus('denied');
        }
      } catch (error: any) {
        const httpStatus = error?.response?.status || error?.status;
        if (httpStatus === 401 || httpStatus === 403 || httpStatus === 404) {
          if (mounted) setStatus('denied');
        } else {
          if (mounted) setStatus('denied');
        }
      }
    }

    verifyAccess();

    return () => {
      mounted = false;
    };
  }, [academyUuid, courseUuid, isAuthLoading, isAuthenticated]);

  if (isAuthLoading || status === 'loading') {
    return <AuthSkeleton />;
  }

  if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid) || status === 'denied') {
    return <Navigate to={`/${academyUuid || ''}/courses/${courseUuid || ''}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
