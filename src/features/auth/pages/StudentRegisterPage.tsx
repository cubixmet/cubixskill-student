import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { usePublicAcademy } from '../../public-academy/layouts/PublicAcademyLayout';
import { authService, type RegisterStudentResponse } from '../services/auth.service';
import { buildLoginUrl, setLastAcademy } from '../../../lib/navigationIntent';
import { Avatar } from '../../../components/ui/Avatar';

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
    <div className="min-h-[100dvh] w-full py-4 px-3 sm:py-8 sm:px-6 flex items-center justify-center font-sans bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-200">
      <div className="w-full max-w-[480px] bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-7 shadow-xl border border-slate-200 dark:border-[#263244] text-left space-y-5 min-w-0 my-auto">
        {/* BRANDING HEADER */}
        <div className="text-center space-y-2.5">
          <Link to={`/${academyUuid}`} className="inline-flex items-center gap-2.5 group">
            <Avatar src={academyEntity.logoUrl} name={academyEntity.name} type="academy" size="md" className="shrink-0" />
            <div className="text-left min-w-0">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-[#F8FAFC] block leading-tight truncate">{academyEntity.name}</span>
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal">Student Portal</span>
            </div>
          </Link>

          {!registerResult && (
            <div className="pt-1 space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                Create Student Account
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal max-w-[340px] mx-auto leading-relaxed">
                Register to join courses under {academyEntity.name}.
              </p>
            </div>
          )}
        </div>

        {/* ERROR ALERT */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-xs text-red-600 dark:text-red-400 flex items-center gap-2.5 font-medium break-words">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words">{errorMsg}</span>
          </div>
        )}

        {/* SUCCESS CARD / EMAIL VERIFICATION REQUIRED STATE */}
        {registerResult ? (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                Registration Successful
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed max-w-sm mx-auto">
                We've sent a verification email to:
              </p>

              {registerResult.email_masked && (
                <div className="p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold inline-block my-1 break-all">
                  {registerResult.email_masked}
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal pt-1 leading-relaxed">
                Please check your inbox and verify your email to continue setting up your account.
              </p>
            </div>

            {resendMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-[#6EE7B7] flex items-center gap-2 justify-center font-medium break-words">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="break-words">{resendMsg}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleResendVerificationEmail}
                disabled={isResending || cooldown > 0}
                className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
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
                className="w-full min-h-[44px] border border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Go to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* FULL NAME */}
            <div className="space-y-1.5">
              <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
                Full Name *
              </label>
              <input
                id="reg-fullname"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                {...register('fullName')}
                className={`w-full min-h-[44px] h-[44px] px-3.5 rounded-xl border ${
                  errors.fullName ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-[#263244]'
                } bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors`}
              />
              {errors.fullName && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium leading-tight break-words">{errors.fullName.message}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
                Email Address *
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="student@example.com"
                autoComplete="email"
                {...register('email')}
                className={`w-full min-h-[44px] h-[44px] px-3.5 rounded-xl border ${
                  errors.email ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-[#263244]'
                } bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors`}
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium leading-tight break-words">{errors.email.message}</p>
              )}
            </div>

            {/* PHONE */}
            <div className="space-y-1.5">
              <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+91 98765 43210"
                autoComplete="tel"
                {...register('phone')}
                className="w-full min-h-[44px] h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-[#263244] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* TERMS CHECKBOX */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-[#94A3B8] font-normal leading-relaxed select-none">
                <input
                  type="checkbox"
                  {...register('termsAccepted')}
                  className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-[#263244] text-blue-600 focus:ring-0 cursor-pointer accent-blue-600 shrink-0"
                />
                <span className="break-words">
                  I agree to the <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Terms of Service</span> and <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Privacy Policy</span>.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1 leading-tight break-words">{errors.termsAccepted.message}</p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] h-[44px] mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Register'}</span>
            </button>

            {/* LOGIN REDIRECT FOOTER */}
            <div className="text-center pt-3 border-t border-slate-200 dark:border-[#263244] text-xs text-slate-500 dark:text-[#94A3B8] font-normal">
              Already have an account?{' '}
              <Link to={loginUrl} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
