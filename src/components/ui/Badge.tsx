import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-full border transition-all duration-200 font-sans select-none whitespace-nowrap shrink-0';

  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary:
      'bg-[var(--theme-primary-soft,#EFF6FF)] text-[var(--theme-primary,#2563EB)] border-[var(--theme-primary,#2563EB)]/30',
  };

  const dots = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500',
    primary: 'bg-[var(--theme-primary,#2563EB)]',
  };

  const sizes = {
    sm: 'h-[24px] min-h-[24px] text-[11px] px-2.5 gap-1.5',
    md: 'h-[28px] min-h-[28px] text-[12px] px-3 gap-1.5',
    lg: 'h-[32px] min-h-[32px] text-[13px] px-3.5 gap-2',
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />}
      <span className="leading-none">{children}</span>
    </span>
  );
};
