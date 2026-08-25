import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { usePublicAcademy } from '../../public-academy/layouts/PublicAcademyLayout';
import { authService } from '../services/auth.service';

const forgotSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid: paramUuid } = useParams<{ academyUuid: string }>();
  const context = usePublicAcademy();

  const academyUuid = context?.academyUuid || paramUuid || '';
  const academyEntity = context?.academyEntity || { name: 'Academy', logoUrl: '' };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginUrl = `/${academyUuid}/login`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const handleFormSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await authService.requestPasswordReset(data.email, academyUuid);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Unable to request password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center font-sans min-h-[calc(100dvh-4rem)]">
      <div className="w-full max-w-[420px] bg-white dark:bg-[#111827] rounded-[14px] p-6 sm:p-8 shadow-xl border border-[#E2E8F0] dark:border-[#263244] text-left space-y-6 min-w-0">
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
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">Password Recovery</span>
            </div>
          </Link>

          {!submitted && (
            <div className="pt-2 space-y-1">
              <h1 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Forgot Your Password?
              </h1>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
                Enter your registered email address to receive password reset instructions.
              </p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-[#DC2626] dark:text-[#F87171] flex items-center gap-2 font-normal">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          /* SUCCESS STATE */
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Check Your Email
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
                If an account exists for this email address, we've sent a password reset link. Open the email to create your new password.
              </p>
            </div>

            <Link
              to={loginUrl}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                {...register('email')}
                className={`w-full h-11 px-3.5 rounded-xl border ${
                  errors.email ? 'border-[#DC2626] dark:border-[#F87171]' : 'border-[#E2E8F0] dark:border-[#263244]'
                } bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
              />
              {errors.email && (
                <p className="text-[11px] text-[#DC2626] dark:text-[#F87171] font-normal">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending Request...' : 'Send Reset Link'}</span>
            </button>

            <div className="text-center pt-3 border-t border-[#E2E8F0] dark:border-[#263244] text-xs">
              <Link to={loginUrl} className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
