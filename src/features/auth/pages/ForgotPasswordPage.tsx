import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-3 sm:p-4 font-sans text-slate-900">
      {/* 420px COMPACT CARD (16px BORDER RADIUS, 20px MOBILE PADDING, 32px DESKTOP PADDING) */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-[20px] sm:p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-slate-100 text-left space-y-0">
        {/* HEADER: 30px Desktop, 28px Tablet, 24px Mobile Title, 15px/13px Subtitle */}
        <div className="text-center space-y-1 mb-[18px]">
          <h1 className="text-[24px] sm:text-[28px] lg:text-[30px] font-bold text-slate-900 tracking-tight leading-[1.2]">
            Reset Your Password
          </h1>
          <p className="text-[13px] sm:text-[15px] font-normal text-[#64748B] max-w-[320px] mx-auto leading-normal">
            Enter your email address to receive a password reset token link.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-[14px]">
            <div className="space-y-1">
              <label className="block text-[13px] font-medium text-slate-800">
                Student Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[44px] px-3.5 rounded-[10px] border border-slate-200 bg-white text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                required
              />
            </div>

            {/* BUTTON: 44px HEIGHT, 15px FONT, 600 WEIGHT, 10px RADIUS */}
            <button
              type="submit"
              className="w-full h-[44px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[15px] rounded-[10px] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              Send Password Reset Link
            </button>
          </form>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[10px] text-center space-y-3">
            <span className="font-semibold text-slate-900 text-sm block">Reset Link Dispatched</span>
            <p className="text-[#64748B] text-[13px]">
              We sent a password setup link to <strong>{email}</strong>.
            </p>
            <Link to="/setup-password?token=demo-reset-token-987" className="block">
              <button
                type="button"
                className="w-full h-[44px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[15px] rounded-[10px] transition-all"
              >
                Simulate Opening Reset Link
              </button>
            </Link>
          </div>
        )}

        {/* BACK TO LOGIN ROW: 13px FONT, 500 WEIGHT */}
        <div className="pt-4 mt-4 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="text-[13px] font-medium text-[#64748B] hover:text-[#2563EB] transition-colors inline-block"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
