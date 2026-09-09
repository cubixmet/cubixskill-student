import React from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useCourseFeatures } from '../hooks/useCourseFeatures';

interface Props {
  featureKey: string;
  children?: React.ReactNode;
}

export const StudentCourseFeatureGuard: React.FC<Props> = ({ featureKey, children }) => {
  const { academyUuid, courseUuid } = useParams<{ academyUuid: string; courseUuid: string }>();
  const { isFeatureEnabled, isLoading } = useCourseFeatures(courseUuid);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#1E293B] max-w-lg mx-auto mt-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Verifying course feature entitlement...</p>
      </div>
    );
  }

  if (!isFeatureEnabled(featureKey)) {
    return <Navigate to={`/student/academies/${academyUuid || ''}/courses/${courseUuid || ''}/overview`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
