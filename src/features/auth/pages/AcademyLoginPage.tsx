import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ArrowRight, Eye, EyeOff, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { usePublicAcademy } from '../../public-academy/layouts/PublicAcademyLayout';
import { authService } from '../services/auth.service';
import {
  validateInternalReturnPath,
  getCheckoutIntent,
  buildRegisterUrl,
  setLastAcademy,
} from '../../../lib/navigationIntent';
import { Avatar } from '../../../components/ui/Avatar';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const AcademyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { academyUuid: paramUuid } = useParams<{ academyUuid: string }>();
  const context = usePublicAcademy();

  const academyUuid = context?.academyUuid || paramUuid || '';
  const academyEntity = context?.academyEntity || {
    name: 'Academy',
    logoUrl: '',
  };

  const nextParam = searchParams.get('next');

  // Save last academy context
  useEffect(() => {
    if (academyUuid) {
      setLastAcademy(academyUuid);
    }
  }, [academyUuid]);

  const login = useAuthStore((state) => state.login);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);
  const [setupPendingEmail, setSetupPendingEmail] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const registerUrl = buildRegisterUrl(academyUuid, nextParam || undefined);
  const forgotPasswordUrl = `/${academyUuid}/forgot-password`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearAuthError();
    setVerificationPendingEmail(null);
    setSetupPendingEmail(null);
    setResendMsg(null);

    try {
      const success = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        academyUuid,
      });

      if (success) {
        // 1. Check for valid 'next' return URL
        const validNext = validateInternalReturnPath(nextParam, academyUuid);
        if (validNext) {
          navigate(validNext, { replace: true });
          return;
        }

        // 2. Check for checkout intent in sessionStorage
        const checkoutIntent = getCheckoutIntent();
        if (checkoutIntent && checkoutIntent.academyUuid === academyUuid) {
          const intentPath = `/${checkoutIntent.academyUuid}/checkout/${checkoutIntent.courseUuid}`;
          const validIntentPath = validateInternalReturnPath(intentPath, academyUuid);
          if (validIntentPath) {
            navigate(validIntentPath, { replace: true });
            return;
          }
        }

        // 3. Fallback to canonical student dashboard/home
        navigate(`/student/academies/${academyUuid}`, { replace: true });
      }
    } catch (err: any) {
      const errCode = err.response?.data?.code || err.code;
      if (errCode === 'EMAIL_VERIFICATION_REQUIRED') {
        setVerificationPendingEmail(data.email);
      } else if (errCode === 'PASSWORD_SETUP_REQUIRED' || errCode === 'ACCOUNT_SETUP_PENDING') {
        setSetupPendingEmail(data.email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToUse = verificationPendingEmail || getValues('email');
    if (!emailToUse) return;
    setIsResending(true);
    setResendMsg(null);
    try {
      const msg = await authService.resendVerificationEmail({
        email: emailToUse,
        academy_uuid: academyUuid,
      });
      setResendMsg(msg);
    } catch {
      setResendMsg('If an eligible account exists, a verification email has been sent.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResendSetupEmail = async () => {
    const emailToUse = setupPendingEmail || getValues('email');
    if (!emailToUse) return;
    setIsResending(true);
    setResendMsg(null);
    try {
      const msg = await authService.resendSetupEmail({
        email: emailToUse,
        academy_uuid: academyUuid,
      });
      setResendMsg(msg);
    } catch {
      setResendMsg('If an eligible account exists, a password setup email has been sent.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center font-sans min-h-[calc(100dvh-4rem)]">
      <div className="w-full max-w-[420px] bg-white dark:bg-[#111827] rounded-[14px] p-6 sm:p-8 shadow-xl border border-[#E2E8F0] dark:border-[#263244] text-left space-y-6 min-w-0">
        {/* BRANDING HEADER */}
        <div className="text-center space-y-3">
          <Link to={`/${academyUuid}`} className="inline-flex items-center gap-3 group">
            <Avatar src={academyEntity.logoUrl} name={academyEntity.name} type="academy" size="lg" />
            <div className="text-left">
              <span className="font-semibold text-base text-[#0F172A] dark:text-[#F8FAFC] block leading-tight">{academyEntity.name}</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">Student Sign In</span>
            </div>
          </Link>

          <div className="pt-2 space-y-1">
            <h1 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Student Account Login
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
              Sign in with your email and password to access enrolled courses.
            </p>
          </div>
        </div>

        {/* EMAIL VERIFICATION REQUIRED BANNER */}
        {verificationPendingEmail ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/60 space-y-3 text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-start gap-2.5">
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block text-sm">Email Verification Required</span>
                <p className="font-normal text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  Please verify your email address before signing in. Check your inbox for the verification email sent to <span className="font-semibold font-mono">{verificationPendingEmail}</span>.
                </p>
              </div>
            </div>

            {resendMsg && (
              <p className="text-[11.5px] font-medium text-emerald-700 dark:text-[#6EE7B7] bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] p-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                {resendMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full h-9 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Sending Email...' : 'Resend Verification Email'}</span>
            </button>
          </div>
        ) : setupPendingEmail ? (
          /* PASSWORD SETUP REQUIRED BANNER */
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/60 space-y-3 text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-start gap-2.5">
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block text-sm">Password Setup Required</span>
                <p className="font-normal text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  Please use the password setup link sent to your email address: <span className="font-semibold font-mono">{setupPendingEmail}</span>.
                </p>
              </div>
            </div>

            {resendMsg && (
              <p className="text-[11.5px] font-medium text-emerald-700 dark:text-[#6EE7B7] bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] p-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                {resendMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handleResendSetupEmail}
              disabled={isResending}
              className="w-full h-9 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Sending Email...' : 'Resend Setup Email'}</span>
            </button>
          </div>
        ) : authError ? (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#DC2626] dark:text-[#F87171] text-xs font-normal flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Student Email *</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="student@example.com"
              aria-invalid={!!errors.email}
              {...register('email')}
              className={`w-full h-11 px-3.5 rounded-xl border ${
                errors.email ? 'border-[#DC2626] dark:border-[#F87171]' : 'border-[#E2E8F0] dark:border-[#263244]'
              } bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
            />
            {errors.email && <span className="text-[11px] font-normal text-[#DC2626] dark:text-[#F87171] block">{errors.email.message}</span>}
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Password *</label>
            <div className="relative flex items-center">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
                className={`w-full h-11 pl-3.5 pr-10 rounded-xl border ${
                  errors.password ? 'border-[#DC2626] dark:border-[#F87171]' : 'border-[#E2E8F0] dark:border-[#263244]'
                } bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-[11px] font-normal text-[#DC2626] dark:text-[#F87171] block">{errors.password.message}</span>}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-normal text-[#64748B] dark:text-[#CBD5E1] cursor-pointer">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-[#E2E8F0] dark:border-[#263244] text-[#2563EB] focus:ring-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link to={forgotPasswordUrl} className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-[#E2E8F0] dark:border-[#263244] text-xs">
          <span className="text-[#64748B] dark:text-[#94A3B8]">Don't have an account? </span>
          <Link to={registerUrl} className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline">
            Create Student Account
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] pt-1">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>CubixSkill Security &amp; Academy Verification</span>
        </div>
      </div>
    </div>
  );
};
