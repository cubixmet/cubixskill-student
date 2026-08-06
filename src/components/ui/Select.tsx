import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      isSuccess,
      options = [],
      placeholder,
      disabled,
      className = '',
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name || `select-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <div className="w-full space-y-1 font-sans text-xs text-left">
        {label && (
          <label htmlFor={selectId} className="block font-medium text-slate-800 text-xs select-none">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full h-[44px] min-h-[44px] rounded-[10px] border border-[#E2E8F0] px-[14px] pr-10 text-sm font-normal text-slate-900 bg-white appearance-none cursor-pointer transition-all focus:outline-hidden focus:ring-2 focus:ring-[var(--theme-primary,#2563EB)]/20 focus:border-[var(--theme-primary,#2563EB)] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : isSuccess
                ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'hover:border-slate-300'
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {children
              ? children
              : options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))}
          </select>

          <div className="absolute right-3.5 text-slate-400 flex items-center gap-1 pointer-events-none">
            {error ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
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

Select.displayName = 'Select';
