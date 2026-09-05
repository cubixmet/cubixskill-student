import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useAcademyStore } from '../../../stores/academy.store';
import { useAuthStore } from '../../../stores/auth.store';
import { isValidUuid } from '../../../utils/routeBuilder';
import { studentPortalService } from '../../../services/studentPortal.service';
import { AuthSkeleton } from './AuthSkeleton';

interface Props {
  children?: React.ReactNode;
}

export const AcademyEnrollmentGuard: React.FC<Props> = ({ children }) => {
  const { academyUuid, academyId } = useParams<{ academyUuid?: string; academyId?: string }>();
  const currentAcademyId = academyUuid || academyId;

  const loadAcademyThemeByUuid = useAcademyStore((state) => state.loadAcademyThemeByUuid);
  const fetchAcademies = useAcademyStore((state) => state.fetchAcademies);

  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [hasActiveEnrollment, setHasActiveEnrollment] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // 1. Never fetch while auth state is restoring
      if (isAuthLoading) return;

      // 2. If unauthenticated, stop execution and let AuthGuard handle redirect
      if (!isAuthenticated) {
        if (isMounted) setHasAttemptedFetch(true);
        return;
      }

      // 3. If academyId is missing or invalid UUID format, stop immediately without making API calls
      if (!currentAcademyId || !isValidUuid(currentAcademyId)) {
        if (isMounted) setHasAttemptedFetch(true);
        return;
      }

      try {
        await fetchAcademies();
        const enrollments = await studentPortalService.getStudentEnrollments();

        if (isMounted) {
          const activeAcademyEnrollments = (enrollments || []).filter((e: any) => {
            const status = String(e?.status || '').toUpperCase();
            if (status !== 'ACTIVE' && status !== 'COMPLETED') {
              return false;
            }
            const enrollmentAcademyUuid =
              e?.course?.academy_id ||
              e?.course?.academy?.id ||
              e?.course?.academy?.uuid ||
              e?.academy_id ||
              e?.academy_uuid ||
              null;
            if (!enrollmentAcademyUuid) {
              return false;
            }
            return String(enrollmentAcademyUuid) === String(currentAcademyId);
          });

          setHasActiveEnrollment(activeAcademyEnrollments.length >= 1);
          loadAcademyThemeByUuid(currentAcademyId);
          setHasAttemptedFetch(true);
        }
      } catch (err) {
        console.error('Failed to verify academy enrollment:', err);
        if (isMounted) {
          setHasActiveEnrollment(false);
          setHasAttemptedFetch(true);
        }
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [currentAcademyId, isAuthenticated, isAuthLoading, fetchAcademies, loadAcademyThemeByUuid]);

  // Wait for Auth hydration and initial fetch attempt
  if (isAuthLoading || !hasAttemptedFetch) {
    return <AuthSkeleton />;
  }

  // Redirect if currentAcademyId is invalid format
  if (!currentAcademyId || !isValidUuid(currentAcademyId)) {
    return <Navigate to="/student/academies" replace />;
  }

  // Section 7 & 9: Logged-in Student with zero active enrollments in this academy -> redirect to public homepage /:academyId
  if (hasActiveEnrollment === false) {
    return <Navigate to={`/${currentAcademyId}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

