import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { usePublicAcademy } from '../../public-academy/layouts/PublicAcademyLayout';
import { authService } from '../services/auth.service';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { academyUuid: paramUuid } = useParams<{ academyUuid: string }>();
  const context = usePublicAcademy();

  const token = searchParams.get('token') || '';
  const academyUuid = context?.academyUuid || paramUuid || '';
  const academyEntity = context?.academyEntity || { name: 'Academy', logoUrl: '' };

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [setupToken, setSetupToken] = useState<string>('');

  const [resendEmailInput, setResendEmailInput] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const loginUrl = `/${academyUuid}/login`;

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setIsSuccess(false);
      return;
    }

    const doVerify = async () => {
      setIsVerifying(true);
      try {
        const res = await authService.verifyEmail(token);
        setIsSuccess(res.success);
        setSetupToken(res.password_setup_token || '');
      } catch {
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    doVerify();
  }, [token]);

  const handleResendEmail = async () => {
    if (!resendEmailInput.trim()) return;
    setIsResending(true);
    setResendMsg(null);
    try {
      const msg = await authService.resendVerificationEmail({
        email: resendEmailInput.trim(),
        academy_uuid: academyUuid,
      });
      setResendMsg(msg);
    } catch {
      setResendMsg('If an eligible account exists, a verification email has been sent.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToSetupPassword = () => {
    if (setupToken) {
      navigate(`/${academyUuid}/setup-password?token=${encodeURIComponent(setupToken)}`);
    } else {
      navigate(loginUrl);
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
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">Email Verification</span>
            </div>
          </Link>
        </div>

        {/* 1. LOADING STATE */}
        {isVerifying ? (
          <div className="py-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Verifying your email...
            </p>
          </div>
        ) : isSuccess ? (
          /* 2. SUCCESS STATE */
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-600 dark:text-[#6EE7B7] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Email Verified
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
                Your email has been verified successfully. You can now create your password.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoToSetupPassword}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Create Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* 3. INVALID / EXPIRED LINK STATE */
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-2 text-xs text-[#DC2626] dark:text-[#F87171]">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Verification Link Invalid</span>
              </div>
              <p className="font-normal leading-relaxed">
                This verification link has expired or is no longer valid.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                Enter Email to Resend Verification Email:
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                value={resendEmailInput}
                onChange={(e) => setResendEmailInput(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
              />

              {resendMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-[#6EE7B7] font-normal">
                  {resendMsg}
                </div>
              )}

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending || !resendEmailInput.trim()}
                className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Sending Email...' : 'Resend Verification Email'}</span>
              </button>
            </div>

            <div className="text-center pt-3 border-t border-[#E2E8F0] dark:border-[#263244] text-xs">
              <Link to={loginUrl} className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline">
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
