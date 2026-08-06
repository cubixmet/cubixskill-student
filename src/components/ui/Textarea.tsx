import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  maxChars?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      isSuccess,
      maxChars,
      disabled,
      readOnly,
      className = '',
      id,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name || `textarea-${Math.random().toString(36).substring(2, 7)}`;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full space-y-1 font-sans text-xs text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={textareaId} className="block font-medium text-slate-800 text-xs select-none">
              {label}
              {props.required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            {maxChars && (
              <span className="text-[10px] font-mono text-slate-400">
                {currentLength}/{maxChars}
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            className={`w-full min-h-[96px] rounded-[10px] border border-[#E2E8F0] p-[14px] text-sm font-normal text-slate-900 placeholder:text-slate-400 transition-all focus:outline-hidden focus:ring-2 focus:ring-[var(--theme-primary,#2563EB)]/20 focus:border-[var(--theme-primary,#2563EB)] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed read-only:bg-slate-50 resize-y ${
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : isSuccess
                ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'hover:border-slate-300'
            } ${className}`}
            {...props}
          />

          <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
            {error ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : null}
          </div>
        </div>

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

Textarea.displayName = 'Textarea';
