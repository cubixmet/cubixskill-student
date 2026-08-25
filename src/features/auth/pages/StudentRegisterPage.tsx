import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { usePublicAcademy } from '../../public-academy/layouts/PublicAcademyLayout';
import { authService, type RegisterStudentResponse } from '../services/auth.service';
import { buildLoginUrl, setLastAcademy } from '../../../lib/navigationIntent';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms & privacy policy.'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const StudentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid: paramUuid } = useParams<{ academyUuid: string }>();
  const context = usePublicAcademy();

  const academyUuid = context?.academyUuid || paramUuid || '';
  const academyEntity = context?.academyEntity || {
    name: 'Academy',
    logoUrl: '',
  };

  const [searchParams] = useSearchParams();
  const nextParam = searchParams.get('next');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [registerResult, setRegisterResult] = useState<RegisterStudentResponse | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const loginUrl = buildLoginUrl(academyUuid, nextParam || undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      termsAccepted: false,
    },
  });

  // Cooldown timer for Resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleFormSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const actualEmail = data.email.trim().toLowerCase();

    try {
      setRegisteredEmail(actualEmail);
      const res = await authService.registerStudent({
        academy_uuid: academyUuid,
        full_name: data.fullName,
        email: actualEmail,
        phone: data.phone,
        agree_to_terms: data.termsAccepted,
      });
      setRegisterResult(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (isResending || cooldown > 0 || !registeredEmail) return;

    setIsResending(true);
    setResendMsg(null);
    try {
      const msg = await authService.resendVerificationEmail({
        email: registeredEmail,
        academy_uuid: academyUuid,
      });
      setResendMsg(msg);
      setCooldown(60);
    } catch {
      setResendMsg('Unable to request a new verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center font-sans min-h-[calc(100dvh-4rem)]">
      <div className="w-full max-w-[520px] bg-white dark:bg-[#111827] rounded-[14px] p-6 sm:p-8 shadow-xl border border-[#E2E8F0] dark:border-[#263244] text-left space-y-6 min-w-0">
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
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">Student Portal</span>
            </div>
          </Link>

          {!registerResult && (
            <div className="pt-2 space-y-1">
              <h1 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Create Student Account
              </h1>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
                Register to join courses under {academyEntity.name}.
              </p>
            </div>
          )}
        </div>

        {/* ERROR ALERT */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-xs text-[#DC2626] dark:text-[#F87171] flex items-center gap-2.5 font-normal">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SUCCESS CARD / EMAIL VERIFICATION REQUIRED STATE */}
        {registerResult ? (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Registration Successful
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed max-w-sm mx-auto">
                We've sent a verification email to:
              </p>

              {registerResult.email_masked && (
                <div className="p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl text-xs font-mono text-[#2563EB] dark:text-[#60A5FA] font-semibold inline-block my-1">
                  {registerResult.email_masked}
                </div>
              )}

              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal pt-1">
                Please check your inbox and verify your email to continue setting up your account.
              </p>
            </div>

            {resendMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-[#6EE7B7] flex items-center gap-2 justify-center font-normal">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resendMsg}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleResendVerificationEmail}
                disabled={isResending || cooldown > 0}
                className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {isResending
                    ? 'Sending Email...'
                    : cooldown > 0
                    ? `Resend available in ${cooldown}s`
                    : 'Resend Verification Email'}
                </span>
              </button>

              <Link
                to={loginUrl}
                className="w-full h-10 border border-[#E2E8F0] dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-[#64748B] dark:text-[#CBD5E1] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>Go to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* FULL NAME */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                {...register('fullName')}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
              />
              {errors.fullName && (
                <p className="text-[11px] text-[#DC2626] dark:text-[#F87171] font-normal">{errors.fullName.message}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                {...register('email')}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
              />
              {errors.email && (
                <p className="text-[11px] text-[#DC2626] dark:text-[#F87171] font-normal">{errors.email.message}</p>
              )}
            </div>

            {/* PHONE */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                {...register('phone')}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* TERMS CHECKBOX */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
                <input
                  type="checkbox"
                  {...register('termsAccepted')}
                  className="mt-0.5 rounded border-[#E2E8F0] dark:border-[#263244] text-[#2563EB] focus:ring-0 cursor-pointer"
                />
                <span>
                  I agree to the <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Terms of Service</span> and <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Privacy Policy</span>.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-[11px] text-[#DC2626] dark:text-[#F87171] font-normal mt-1">{errors.termsAccepted.message}</p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Register'}</span>
            </button>

            {/* LOGIN REDIRECT FOOTER */}
            <div className="text-center pt-4 text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
              Already have an account?{' '}
              <Link to={loginUrl} className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
