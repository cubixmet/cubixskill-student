import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingText,
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] font-sans whitespace-nowrap';

  const variants = {
    primary:
      'bg-[var(--theme-primary,#2563EB)] text-white hover:bg-[var(--theme-primary-hover,#1D4ED8)] shadow-2xs focus-visible:ring-[var(--theme-primary,#2563EB)]',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs focus-visible:ring-slate-900',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs focus-visible:ring-rose-600',
  };

  const sizes = {
    sm: 'h-[36px] min-h-[36px] px-3.5 text-xs gap-2',
    md: 'h-[48px] min-h-[48px] px-5 text-sm gap-2',
    lg: 'h-[52px] min-h-[52px] px-6 text-sm gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      style={style}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 text-current animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex items-center justify-center shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex items-center justify-center shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
