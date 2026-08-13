import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';
import { useEnrollmentStore } from '../../../stores/enrollment.store';
import { resolveStudentEntry } from '../../../utils/studentEntryResolver';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const AcademyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const courseUuid = searchParams.get('course');
  const intent = (searchParams.get('intent') as 'demo' | 'full') || 'full';

  const getAcademyByUuid = useAcademyStore((state) => state.getAcademyByUuid);
  const loadAcademyThemeByUuid = useAcademyStore((state) => state.loadAcademyThemeByUuid);
  const getCourseByUuid = useCourseStore((state) => state.getCourseByUuid);

  const createOrUpdateEnrollment = useEnrollmentStore((state) => state.createOrUpdateEnrollment);

  const login = useAuthStore((state) => state.login);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (academyUuid) {
      loadAcademyThemeByUuid(academyUuid);
    }
  }, [academyUuid, loadAcademyThemeByUuid]);

  const academy = getAcademyByUuid(academyUuid || '');

  const backUrl = academyUuid
    ? courseUuid
      ? `/${academyUuid}/courses/${courseUuid}`
      : `/${academyUuid}/courses`
    : '/';

  const registerUrl = academyUuid
    ? `/${academyUuid}/register?${new URLSearchParams({
        ...(courseUuid ? { course: courseUuid } : {}),
        intent,
        ...(returnTo ? { returnTo } : {}),
      }).toString()}`
    : '/register';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'student@example.com',
      password: 'password123',
      rememberMe: true,
    },
  });

  const handleFormError = () => {
    const firstError = document.querySelector('.border-red-500, input:invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearAuthError();
    const success = await login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
      academyUuid,
    });
    setIsSubmitting(false);

    if (success) {
      const authStudent = useAuthStore.getState().student;
      const studentUuid = authStudent?.uuid || 'std-production-1';

      // 1. Provision or restore course enrollment if course & intent present
      if (courseUuid && academyUuid) {
        const courseObj = getCourseByUuid(courseUuid);
        createOrUpdateEnrollment({
          studentUuid,
          academyUuid,
          courseUuid,
          accessType: intent === 'demo' ? 'demo' : 'full',
          demoDurationDays: courseObj?.demoDurationDays || 5,
        });
      }

      // 2. Resolve target destination using strict priority chain
      const targetRoute = resolveStudentEntry({
        studentUuid,
        academyUuid,
        courseUuid: courseUuid || undefined,
        returnTo,
        intent,
      });

      navigate(targetRoute, { replace: true });
    }
  };

  if (!academy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold text-slate-900">Academy Not Found</h1>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
          Return to Portal
        </Link>
      </div>
    );
  }

  const primaryStyle = { backgroundColor: academy.theme.primaryColor };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-3 sm:p-4 font-sans text-slate-900">
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-left space-y-6">
        {/* BACK TO COURSE LINK */}
        <div className="flex items-center justify-between">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course</span>
          </Link>
          {intent === 'demo' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>Demo Login</span>
            </span>
          )}
        </div>

        {/* BRANDING HEADER */}
        <div className="text-center space-y-3">
          <Link to={`/${academy.uuid}`} className="inline-flex items-center gap-3 group">
            <img
              src={academy.logoUrl}
              alt={academy.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="text-left">
              <span className="font-extrabold text-base text-slate-900 block leading-tight">{academy.name}</span>
              <span className="text-[11px] text-slate-500 font-medium">CubixSkill Student Portal</span>
            </div>
          </Link>

          <div className="pt-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {intent === 'demo' ? 'Sign In for Demo Access' : 'Student Account Login'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your Global Student Identity to access enrolled courses.
            </p>
          </div>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-800">Global Student Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="student@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
              className={`w-full h-[46px] px-3.5 rounded-xl border ${
                errors.email ? 'border-red-500' : 'border-slate-200'
              } bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            {errors.email && <span id="email-error" className="text-[11px] font-semibold text-red-600 block">{errors.email.message}</span>}
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-800">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
              className={`w-full h-[46px] px-3.5 rounded-xl border ${
                errors.password ? 'border-red-500' : 'border-slate-200'
              } bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            {errors.password && <span id="password-error" className="text-[11px] font-semibold text-red-600 block">{errors.password.message}</span>}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="font-semibold text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={primaryStyle}
            className="w-full h-[48px] text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 hover:opacity-95"
          >
            <span>{isSubmitting ? 'Authenticating...' : intent === 'demo' ? 'Launch Demo Access' : 'Sign In & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">Don't have an account? </span>
          <Link to={registerUrl} className="font-bold text-blue-600 hover:underline">
            Register Now
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>CubixSkill Global Identity &amp; Multi-Tenant Security</span>
      </div>
    </div>
  );
};

