import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, CheckCircle2, ArrowRight, ArrowLeft, MailCheck, ExternalLink, Sparkles } from 'lucide-react';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';
import { usePasswordTokenStore, type PasswordSetupToken } from '../../../stores/password-token.store';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms & privacy policy.'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const StudentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const courseUuid = searchParams.get('course');
  const intent = (searchParams.get('intent') as 'demo' | 'full') || 'full';

  const getAcademyByUuid = useAcademyStore((state) => state.getAcademyByUuid);
  const loadAcademyThemeByUuid = useAcademyStore((state) => state.loadAcademyThemeByUuid);
  const getCourseByUuid = useCourseStore((state) => state.getCourseByUuid);
  const createToken = usePasswordTokenStore((state) => state.createToken);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<PasswordSetupToken | null>(null);

  useEffect(() => {
    if (academyUuid) {
      loadAcademyThemeByUuid(academyUuid);
    }
  }, [academyUuid, loadAcademyThemeByUuid]);

  const academy = getAcademyByUuid(academyUuid || '');
  const course = courseUuid ? getCourseByUuid(courseUuid) : undefined;

  const backUrl = academyUuid
    ? courseUuid
      ? `/${academyUuid}/courses/${courseUuid}`
      : `/${academyUuid}/courses`
    : '/';

  const loginUrl = academyUuid
    ? `/${academyUuid}/login?${new URLSearchParams({
        ...(courseUuid ? { course: courseUuid } : {}),
        intent,
        ...(returnTo ? { returnTo } : {}),
      }).toString()}`
    : '/login';

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
      termsAccepted: true,
    },
  });

  const handleFormError = () => {
    const firstError = document.querySelector('.border-red-500, input:invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFormSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

    const tokenObj = createToken({
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      academyUuid: academyUuid || '',
      courseUuid: courseUuid || undefined,
      intent,
    });

    setIsSubmitting(false);
    setCreatedToken(tokenObj);
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
  const setupUrl = createdToken ? `${window.location.origin}/setup-password?token=${createdToken.token}` : '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-3 sm:p-4 font-sans text-slate-900">
      <div className="w-full max-w-[460px] bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-left space-y-6">
        {/* BACK TO COURSE BUTTON */}
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
              <span>Demo Registration</span>
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
              <span className="text-[11px] text-slate-500 font-medium">Global Student Registration</span>
            </div>
          </Link>

          <div className="pt-2 space-y-1">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {intent === 'demo' ? 'Register for Free Demo Access' : 'Create Student Account'}
            </h1>
            {course ? (
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">Course: {course.title}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Register once with your Global Student Identity under {academy.name}.
              </p>
            )}
          </div>
        </div>

        {/* SUCCESS VIEW (PASSWORD SETUP EMAIL NOTIFICATION) */}
        {createdToken ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <MailCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold text-sm block">Registration Successful!</span>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  We sent a secure password setup link to <span className="font-bold">{createdToken.email}</span>. Please check your inbox to configure your password.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="font-bold text-slate-900">Next Steps:</div>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>Open the password setup email sent to your address.</li>
                <li>Create your secure Global Student password.</li>
                <li>Sign in to access your course portal automatically.</li>
              </ol>
            </div>

            {/* DEV TESTING FAST-FORWARD BUTTON */}
            <div className="pt-2 space-y-2">
              <a href={setupUrl} className="block">
                <button
                  type="button"
                  style={primaryStyle}
                  className="w-full h-[48px] text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 hover:opacity-95"
                >
                  <span>Open Password Setup Link</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </a>

              <Link to={loginUrl} className="block">
                <button
                  type="button"
                  className="w-full h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Go to Login
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-800">Full Name</label>
              <input
                id="reg-fullname"
                type="text"
                placeholder="Alex Student"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullname-error' : undefined}
                {...register('fullName')}
                className={`w-full h-[46px] px-3.5 rounded-xl border ${
                  errors.fullName ? 'border-red-500' : 'border-slate-200'
                } bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              {errors.fullName && <span id="fullname-error" className="text-[11px] font-semibold text-red-600 block">{errors.fullName.message}</span>}
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-800">Email Address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="alex@student.com"
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
              <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-800">Phone Number (Optional)</label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+1 (555) 019-2831"
                {...register('phone')}
                className="w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  aria-invalid={!!errors.termsAccepted}
                  aria-describedby={errors.termsAccepted ? 'terms-error' : undefined}
                  {...register('termsAccepted')}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                />
                <span>I agree to the Terms of Service &amp; Privacy Policy for CubixSkill.</span>
              </label>
              {errors.termsAccepted && (
                <span id="terms-error" className="text-[11px] font-semibold text-red-600 block">{errors.termsAccepted.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={primaryStyle}
              className="w-full h-[48px] text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 hover:opacity-95"
            >
              <span>{isSubmitting ? 'Submitting Registration...' : 'Create Student Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">Already have an account? </span>
          <Link to={loginUrl} className="font-bold text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>One Global Account for All CubixSkill Academies</span>
      </div>
    </div>
  );
};


