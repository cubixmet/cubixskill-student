import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Loader2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { getLastActiveCourse } from '../../../utils/last-active-course.utility';
import { resolveStudentEntry } from '../../../utils/studentEntryResolver';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const demoToken = searchParams.get('demoToken');
  const courseUuid = searchParams.get('course') || '9c78bda1-98c2-4b11-8b81-92d3db12b501';

  const login = useAuthStore((state) => state.login);
  const startDemoExperience = useAuthStore((state) => state.startDemoExperience);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const intendedRoute = useAuthStore((state) => state.intendedRoute);
  const setIntendedRoute = useAuthStore((state) => state.setIntendedRoute);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivatingDemoToken, setIsActivatingDemoToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (demoToken) {
      setIsActivatingDemoToken(true);
      clearAuthError();

      // Auto-activate demo token session
      setTimeout(() => {
        startDemoExperience();
        setIsActivatingDemoToken(false);
        navigate(`/student/academies/550e8400-e29b-41d4-a716-446655440000/courses/${courseUuid}/overview`, { replace: true });
      }, 600);
    }
  }, [demoToken, courseUuid, navigate, startDemoExperience, clearAuthError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const getTargetRoute = (): string => {
    const locationStateFrom = (location.state as { from?: string | { pathname: string } })?.from;
    const fromPath = typeof locationStateFrom === 'string' ? locationStateFrom : locationStateFrom?.pathname;
    if (fromPath && fromPath !== '/login') return fromPath;
    if (intendedRoute && intendedRoute !== '/login') return intendedRoute;

    const lastActive = getLastActiveCourse();
    if (lastActive && lastActive.academyUuid && lastActive.courseUuid) {
      return `/student/academies/${lastActive.academyUuid}/courses/${lastActive.courseUuid}/overview`;
    }

    return '/student/academies';
  };

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearAuthError();
    const success = await login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
    setIsSubmitting(false);

    if (success) {
      const authStudent = useAuthStore.getState().student;
      const studentUuid = authStudent?.uuid || 'std-production-1';

      const locationStateFrom = (location.state as { from?: string | { pathname: string } })?.from;
      const fromPath = typeof locationStateFrom === 'string' ? locationStateFrom : locationStateFrom?.pathname;

      const targetRoute = resolveStudentEntry({
        studentUuid,
        returnTo: fromPath && fromPath !== '/login' ? fromPath : intendedRoute && intendedRoute !== '/login' ? intendedRoute : null,
      });

      setIntendedRoute(null);
      navigate(targetRoute, { replace: true });
    }
  };

  if (isActivatingDemoToken) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col items-center justify-center p-4 text-center font-sans text-xs">
        <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] shadow-xl space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Activating Demo Session...</h2>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-xs font-normal">Validating temporary access token and loading demo course environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-left transition-colors duration-200">
      <div className="w-full max-w-[420px] min-w-0 space-y-6">
        {/* BRAND LOGO & HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 mx-auto mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              CubixSkill
            </span>
          </div>

          <h1 className="text-22px sm:text-[24px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm font-normal text-[#64748B] dark:text-[#94A3B8] max-w-[340px] mx-auto leading-relaxed">
            Login to continue your learning journey
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="w-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[14px] p-4 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_6px_18px_rgba(15,23,42,0.05)] dark:shadow-[0_0_0_1px_rgba(37,99,235,0.04),0_6px_18px_rgba(37,99,235,0.06)] space-y-4">
          {authError && (
            <div className="p-3 bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.08)] border border-[#FECACA] dark:border-[rgba(248,113,113,0.22)] rounded-[8px] text-[#B91C1C] dark:text-[#FCA5A5] text-xs font-medium text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* EMAIL ADDRESS FIELD */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-[13px] font-medium text-[#475569] dark:text-[#CBD5E1]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                autoComplete="email"
                {...register('email')}
                className={`w-full min-h-[44px] h-[44px] px-3.5 rounded-[8px] border ${
                  errors.email
                    ? 'border-[#DC2626] dark:border-[#F87171]'
                    : 'border-[#CBD5E1] dark:border-[#334155]'
                } bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] text-xs sm:text-[13px] font-normal focus:outline-none focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 transition-all`}
              />
              {errors.email && (
                <span className="text-[11px] font-normal text-[#DC2626] dark:text-[#F87171] block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* PASSWORD FIELD WITH EYE TOGGLE */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-[13px] font-medium text-[#475569] dark:text-[#CBD5E1]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`w-full min-h-[44px] h-[44px] pl-3.5 pr-11 rounded-[8px] border ${
                    errors.password
                      ? 'border-[#DC2626] dark:border-[#F87171]'
                      : 'border-[#CBD5E1] dark:border-[#334155]'
                  } bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] text-xs sm:text-[13px] font-normal focus:outline-none focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] w-10 h-10 flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors rounded-lg cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] font-normal text-[#DC2626] dark:text-[#F87171] block">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* REMEMBER ME & FORGOT PASSWORD */}
            <div className="flex items-center justify-between min-h-[36px] text-xs sm:text-[13px]">
              <label className="flex items-center gap-2 font-normal text-[#475569] dark:text-[#CBD5E1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-[#94A3B8] dark:border-[#64748B] bg-white dark:bg-[#0F172A] text-[#2563EB] focus:ring-[#3B82F6]/20 cursor-pointer accent-[#2563EB]"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] h-[44px] bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm rounded-[8px] transition-all shadow-[0_4px_12px_rgba(37,99,235,0.14)] cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>

        {/* BOTTOM SSL BADGE */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8]">
          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Enterprise SSL Secure Authentication</span>
        </div>
      </div>
    </div>
  );
};
