import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, disabled, className = '', id, checked, ...props }, ref) => {
    const radioId = id || `rad-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <label
        htmlFor={radioId}
        className={`inline-flex items-start gap-2.5 min-h-[44px] py-2 cursor-pointer select-none font-sans text-xs ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            id={radioId}
            ref={ref}
            type="radio"
            disabled={disabled}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="w-5 h-5 rounded-full border border-slate-300 bg-white transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--theme-primary,#2563EB)]/30 peer-checked:border-[var(--theme-primary,#2563EB)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary,#2563EB)] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="font-semibold text-slate-800 text-xs">{label}</span>}
            {description && <span className="text-[11px] text-slate-500 font-normal">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
