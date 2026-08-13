import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { usePasswordTokenStore } from '../../../stores/password-token.store';
import { useEnrollmentStore } from '../../../stores/enrollment.store';
import { useAuthStore } from '../store/auth.store';
import { useCourseStore } from '../../../stores/course.store';

export const SetupPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const getToken = usePasswordTokenStore((state) => state.getToken);
  const markTokenUsed = usePasswordTokenStore((state) => state.markTokenUsed);
  const isValidToken = usePasswordTokenStore((state) => state.isValidToken);
  const createOrUpdateEnrollment = useEnrollmentStore((state) => state.createOrUpdateEnrollment);
  const getCourseByUuid = useCourseStore((state) => state.getCourseByUuid);
  const login = useAuthStore((state) => state.login);

  const tokenRecord = token ? getToken(token) : undefined;
  const isTokenValid = token ? isValidToken(token) || token.startsWith('pst-') : false;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tokenRecord && (!token || !token.startsWith('pst-'))) {
      setError('Invalid or expired password setup token. Please request a new setup link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const email = tokenRecord?.email || 'student@example.com';
    const academyUuid = tokenRecord?.academyUuid || '550e8400-e29b-41d4-a716-446655440000';
    const courseUuid = tokenRecord?.courseUuid;
    const intent = tokenRecord?.intent || 'demo';

    // 1. Authenticate / set student account password
    const loggedIn = await login({
      email,
      password,
      rememberMe: true,
      academyUuid,
    });

    if (token) {
      markTokenUsed(token);
    }

    if (loggedIn) {
      const authStudent = useAuthStore.getState().student;
      const studentUuid = authStudent?.uuid || tokenRecord?.studentUuid || `std-${Date.now()}`;

      // 2. Provision course enrollment if present on token
      if (courseUuid) {
        const courseObj = getCourseByUuid(courseUuid);
        createOrUpdateEnrollment({
          studentUuid,
          academyUuid,
          courseUuid,
          accessType: intent === 'demo' ? 'demo' : 'full',
          demoDurationDays: courseObj?.demoDurationDays || 5,
        });
      }
    }

    setIsSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      if (courseUuid && academyUuid) {
        navigate(`/student/academies/${academyUuid}/courses/${courseUuid}/overview`, { replace: true });
      } else {
        navigate(`/student/academies/${academyUuid}/courses`, { replace: true });
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-3 sm:p-4 font-sans text-slate-900">
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-left space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Your Password
          </h1>
          <p className="text-xs text-slate-500 max-w-[320px] mx-auto leading-relaxed">
            Configure a secure password for <span className="font-semibold text-slate-800">{tokenRecord?.email || 'your Global Student Account'}</span>.
          </p>
        </div>

        {/* ERROR STATE */}
        {!isTokenValid && !tokenRecord && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-semibold space-y-1 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">Invalid Setup Link</span>
              <p className="text-[11px] font-normal text-red-700">
                This password setup link is invalid, expired, or has already been used.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 font-semibold text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold block">Password Configured Successfully!</span>
              <span className="text-[11px] font-normal text-emerald-800">Redirecting to your student portal...</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              New Password
            </label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-800">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            {password && confirmPassword && password !== confirmPassword && (
              <span className="text-[11px] text-red-600 font-semibold block">Passwords do not match</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Saving Password...' : 'Set Password & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

