import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

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
      const target = getTargetRoute();
      setIntendedRoute(null);
      navigate(target, { replace: true });
    }
  };

  if (isActivatingDemoToken) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-sans text-xs">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Activating Demo Session...</h2>
          <p className="text-slate-500 text-xs">Validating 5-day temporary access token and loading demo course environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-3 sm:p-4 font-sans text-slate-900">
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-[20px] sm:p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-slate-100 text-left space-y-0">
        <div className="text-center space-y-1 mb-[18px]">
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight leading-[1.15]">
            Welcome to Student Portal
          </h1>
          <p className="text-[13px] font-medium text-slate-500 max-w-[320px] mx-auto leading-[1.4]">
            Sign in with your email to access your enrolled academy.
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-[14px]">
          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-slate-800">
              Email Address
            </label>
            <input
              type="email"
              placeholder="alex@gmail.com"
              {...register('email')}
              className={`w-full h-[44px] px-3.5 rounded-[10px] border ${
                errors.email ? 'border-red-500' : 'border-slate-200'
              } bg-white text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all`}
            />
            {errors.email && (
              <span className="text-[11px] font-semibold text-red-600 block">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-slate-800">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full h-[44px] px-3.5 rounded-[10px] border ${
                errors.password ? 'border-red-500' : 'border-slate-200'
              } bg-white text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all`}
            />
            {errors.password && (
              <span className="text-[11px] font-semibold text-red-600 block">{errors.password.message}</span>
            )}
          </div>

          <div className="flex items-center justify-between h-[36px] text-[13px]">
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
            className="w-full h-[44px] bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold text-[15px] rounded-[10px] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Enterprise SSL Secure Authentication</span>
      </div>
    </div>
  );
};
