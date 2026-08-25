import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { AcademyEnrollmentGuard } from '../../auth/components/AcademyEnrollmentGuard';
import { StudentDashboardPage } from '../../academies/pages/StudentDashboardPage';
import { AcademyHomePage } from '../pages/AcademyHomePage';
import { AuthSkeleton } from '../../auth/components/AuthSkeleton';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const AcademyRouteDispatcher: React.FC = () => {
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const isValidUuid = !!academyUuid && UUID_REGEX.test(academyUuid.trim());

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (!isValidUuid) {
    return <AcademyHomePage />;
  }

  if (isAuthenticated) {
    return (
      <AcademyEnrollmentGuard>
        <StudentDashboardPage />
      </AcademyEnrollmentGuard>
    );
  }

  return <AcademyHomePage />;
};
