import React, { forwardRef } from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, disabled, className = '', id, checked, onChange, ...props }, ref) => {
    const switchId = id || `sw-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <label
        htmlFor={switchId}
        className={`inline-flex items-center justify-between gap-4 min-h-[44px] py-1 cursor-pointer select-none font-sans text-xs w-full ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {(label || description) && (
          <div className="flex flex-col min-w-0">
            {label && <span className="font-semibold text-slate-800 text-xs truncate">{label}</span>}
            {description && <span className="text-[11px] text-slate-500 font-normal truncate">{description}</span>}
          </div>
        )}

        <div className="relative shrink-0">
          <input
            id={switchId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div className="w-11 h-6 rounded-full bg-slate-200 peer-checked:bg-[var(--theme-primary,#2563EB)] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--theme-primary,#2563EB)]/30 relative">
            <div className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 left-0.5 transition-transform peer-checked:translate-x-5" />
          </div>
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';
