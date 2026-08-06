import React, { forwardRef } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      isSuccess,
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      readOnly,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || `input-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <div className="w-full space-y-1 font-sans text-xs text-left">
        {label && (
          <label htmlFor={inputId} className="block font-medium text-slate-800 text-xs select-none">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled || isLoading}
            readOnly={readOnly}
            className={`w-full h-[44px] min-h-[44px] rounded-[10px] border border-[#E2E8F0] px-[14px] text-sm font-normal text-slate-900 placeholder:text-slate-400 transition-all focus:outline-hidden focus:ring-2 focus:ring-[var(--theme-primary,#2563EB)]/20 focus:border-[var(--theme-primary,#2563EB)] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200 read-only:bg-slate-50 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon || isSuccess || isLoading || error ? 'pr-10' : ''} ${
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : isSuccess
                ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'hover:border-slate-300'
            } ${className}`}
            {...props}
          />

          {/* RIGHT INDICATORS */}
          <div className="absolute right-3.5 text-slate-400 flex items-center gap-1.5 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            ) : error ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              rightIcon
            )}
          </div>
        </div>

        {/* ERROR OR HELPER TEXT IMMEDIATELY BELOW FIELD */}
        {error ? (
          <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
            <span>❌</span>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500 font-normal mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
