import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export const SetupPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password === confirmPassword) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-3 sm:p-4 font-sans text-slate-900">
      {/* 420px COMPACT CARD */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-[20px] sm:p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-slate-100 text-left space-y-0">
        {/* HEADER */}
        <div className="text-center space-y-1 mb-[18px]">
          <h1 className="text-[24px] sm:text-[28px] lg:text-[30px] font-bold text-slate-900 tracking-tight leading-[1.2]">
            Set Up Your Password
          </h1>
          <p className="text-[13px] sm:text-[15px] font-normal text-[#64748B] max-w-[320px] mx-auto leading-normal">
            Configure a secure password to activate your student account.
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-[10px] text-emerald-900 font-semibold text-[13px] text-center">
            Password configured successfully! Redirecting to sign in...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[14px]">
          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-slate-800">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 bg-white text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[13px] font-medium text-slate-800">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 bg-white text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              required
            />
            {password && confirmPassword && password !== confirmPassword && (
              <span className="text-[11px] text-rose-600 font-medium block">Passwords do not match</span>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full h-[44px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[15px] rounded-[10px] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
          >
            Save Password &amp; Sign In
          </button>
        </form>

        {/* FOOTER ROW */}
        <div className="pt-4 mt-4 border-t border-slate-100 text-center space-y-1">
          <Link
            to="/login"
            className="text-[13px] font-medium text-[#64748B] hover:text-[#2563EB] transition-colors inline-block"
          >
            Back to Sign In
          </Link>
          <div className="text-[11px] font-mono text-slate-400">
            Token Verified: {token || 'demo-token-active'}
          </div>
        </div>
      </div>
    </div>
  );
};
