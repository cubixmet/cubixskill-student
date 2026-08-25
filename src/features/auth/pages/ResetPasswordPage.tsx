import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { usePublicAcademy } from '../../public-academy/layouts/PublicAcademyLayout';
import { authService } from '../services/auth.service';

const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { academyUuid: paramUuid } = useParams<{ academyUuid: string }>();
  const context = usePublicAcademy();

  const token = searchParams.get('token') || '';
  const academyUuid = context?.academyUuid || paramUuid || '';
  const academyEntity = context?.academyEntity || { name: 'Academy', logoUrl: '' };

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ email_masked?: string } | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successState, setSuccessState] = useState(false);

  const loginUrl = `/${academyUuid}/login`;
  const forgotPasswordUrl = `/${academyUuid}/forgot-password`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setIsTokenValid(false);
      return;
    }

    const checkToken = async () => {
      setIsValidating(true);
      try {
        const res = await authService.validateToken(token);
        setIsTokenValid(res.valid);
        setTokenInfo(res);
      } catch {
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const handleFormSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await authService.resetPassword(token, data.newPassword, data.confirmPassword);
      setSuccessState(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Password reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center font-sans min-h-[calc(100dvh-4rem)]">
      <div className="w-full max-w-[440px] bg-white dark:bg-[#111827] rounded-[14px] p-6 sm:p-8 shadow-xl border border-[#E2E8F0] dark:border-[#263244] text-left space-y-6 min-w-0">
        {/* BRANDING HEADER */}
        <div className="text-center space-y-3">
          <Link to={`/${academyUuid}`} className="inline-flex items-center gap-3 group">
            {academyEntity.logoUrl ? (
              <img
                src={academyEntity.logoUrl}
                alt={academyEntity.name}
                className="w-11 h-11 rounded-full object-cover border border-[#E2E8F0] dark:border-[#263244] group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] font-semibold text-xs flex items-center justify-center">
                {academyEntity.name.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <span className="font-semibold text-base text-[#0F172A] dark:text-[#F8FAFC] block leading-tight">{academyEntity.name}</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">Reset Password</span>
            </div>
          </Link>

          <div className="pt-2 space-y-1">
            <h1 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
              {tokenInfo?.email_masked ? `Set a new password for ${tokenInfo.email_masked}` : 'Enter your new password below.'}
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {isValidating ? (
          <div className="py-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
            Validating reset link...
          </div>
        ) : successState ? (
          /* SUCCESS STATE */
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-600 dark:text-[#6EE7B7] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Password Reset Successfully
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
                You can now sign in with your new password.
              </p>
            </div>
            <Link
              to={loginUrl}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Go to Login</span>
            </Link>
          </div>
        ) : !isTokenValid ? (
          /* INVALID / EXPIRED TOKEN STATE */
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-2 text-xs text-[#DC2626] dark:text-[#F87171]">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Link Expired or Invalid</span>
              </div>
              <p className="font-normal leading-relaxed">
                This password reset link has expired or is invalid. Please request a new link.
              </p>
            </div>

            <Link
              to={forgotPasswordUrl}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Request New Reset Link</span>
            </Link>

            <div className="text-center pt-3 border-t border-[#E2E8F0] dark:border-[#263244] text-xs">
              <Link to={loginUrl} className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-[#DC2626] dark:text-[#F87171] flex items-center gap-2 font-normal">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* NEW PASSWORD */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                New Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  {...register('newPassword')}
                  className={`w-full h-11 pl-3.5 pr-10 rounded-xl border ${
                    errors.newPassword ? 'border-[#DC2626] dark:border-[#F87171]' : 'border-[#E2E8F0] dark:border-[#263244]'
                  } bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] text-[#DC2626] dark:text-[#F87171] font-normal">{errors.newPassword.message}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                Confirm New Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  {...register('confirmPassword')}
                  className={`w-full h-11 pl-3.5 pr-10 rounded-xl border ${
                    errors.confirmPassword ? 'border-[#DC2626] dark:border-[#F87171]' : 'border-[#E2E8F0] dark:border-[#263244]'
                  } bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-[#DC2626] dark:text-[#F87171] font-normal">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Resetting Password...' : 'Reset Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
