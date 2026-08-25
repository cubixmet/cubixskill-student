import React from 'react';
import { useParams, Navigate, Outlet, Link } from 'react-router-dom';
import { Clock, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { AuthSkeleton } from './AuthSkeleton';
import { useAuthStore } from '../../../stores/auth.store';
import { useEnrollmentStore } from '../../../stores/enrollment.store';
import { Button } from '../../../components/ui/Button';
import { isValidUuid } from '../../../utils/routeBuilder';

interface Props {
  children?: React.ReactNode;
}

export const CourseEnrollmentGuard: React.FC<Props> = ({ children }) => {
  const { academyUuid, courseUuid } = useParams<{ academyUuid: string; courseUuid: string }>();
  const isLoading = useAuthStore((state) => state.isLoading);
  const student = useAuthStore((state) => state.student);

  const getEnrollment = useEnrollmentStore((state) => state.getEnrollment);
  const createOrUpdateEnrollment = useEnrollmentStore((state) => state.createOrUpdateEnrollment);
  const upgradeToFullAccess = useEnrollmentStore((state) => state.upgradeToFullAccess);

  if (isLoading) {
    return <AuthSkeleton />;
  }

  if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
    return <Navigate to="/student/academies" replace />;
  }

  const studentUuid = student?.uuid || 'std-production-1';
  let enrollment = getEnrollment(studentUuid, courseUuid!);

  // If student has no recorded enrollment for this course yet, auto-provision default active full enrollment
  if (!enrollment) {
    enrollment = createOrUpdateEnrollment({
      studentUuid,
      academyUuid: academyUuid!,
      courseUuid: courseUuid!,
      accessType: 'full',
    });
  }

  // Handle Expired Demo Access State
  if (enrollment.accessType === 'demo' && enrollment.status === 'expired') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans text-xs">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Period Ended</span>
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Demo Access Has Expired</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your temporary demo access for this course has ended. Upgrade to Full Course Access to unlock all modules, live classes, quizzes, and your verified certificate.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-slate-700">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>What Full Course Access Includes:</span>
            </div>
            <ul className="text-[11px] space-y-1 pl-6 list-disc text-slate-600">
              <li>Complete lifetime access to all curriculum modules</li>
              <li>Interactive quizzes &amp; graded assignments</li>
              <li>1-on-1 instructor chat &amp; live classes</li>
              <li>Instant QR-Verifiable Certificate</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold justify-center min-h-[48px]"
              onClick={() => {
                upgradeToFullAccess(studentUuid, courseUuid!);
                window.location.reload();
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Upgrade to Full Course Access
            </Button>
            <Link to={`/${academyUuid}/courses/${courseUuid}`} className="block">
              <Button size="md" variant="outline" className="w-full font-semibold justify-center">
                Back to Course Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
