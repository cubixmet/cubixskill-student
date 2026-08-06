import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, disabled, className = '', id, checked, ...props }, ref) => {
    const checkboxId = id || props.name || `chk-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <div className="space-y-1 font-sans text-xs text-left">
        <label
          htmlFor={checkboxId}
          className={`inline-flex items-start gap-2.5 min-h-[44px] py-2 cursor-pointer select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="relative flex items-center justify-center mt-0.5 shrink-0">
            <input
              id={checkboxId}
              ref={ref}
              type="checkbox"
              disabled={disabled}
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`w-5 h-5 rounded-md border border-slate-300 bg-white transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--theme-primary,#2563EB)]/30 peer-checked:bg-[var(--theme-primary,#2563EB)] peer-checked:border-[var(--theme-primary,#2563EB)] ${
                error ? 'border-rose-500' : ''
              } ${className}`}
            >
              <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 stroke-[3] transition-opacity" />
            </div>
          </div>

          {(label || description) && (
            <div className="flex flex-col">
              {label && <span className="font-semibold text-slate-800 text-xs">{label}</span>}
              {description && <span className="text-[11px] text-slate-500 font-normal">{description}</span>}
            </div>
          )}
        </label>

        {error && (
          <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <span>❌</span>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
