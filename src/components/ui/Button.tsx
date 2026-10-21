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
      'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground,#ffffff)] hover:bg-[var(--brand-primary-hover)] shadow-2xs focus-visible:ring-[var(--brand-primary)]',
    secondary: 'bg-[var(--surface-hover)] text-[var(--text-primary)] hover:bg-[var(--border)] shadow-2xs focus-visible:ring-[var(--brand-primary)]',
    outline: 'border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:ring-[var(--brand-primary)]',
    ghost: 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:ring-[var(--brand-primary)]',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs focus-visible:ring-rose-600',
  };

  const sizes = {
    sm: 'h-[44px] min-h-[44px] sm:h-[36px] sm:min-h-[36px] px-3.5 text-xs gap-2',
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
          <Loader2 className="h-4 w-4 text-current animate-spin shrink-0" />
          <span className="whitespace-nowrap leading-none">{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex items-center justify-center shrink-0">{leftIcon}</span>}
          {typeof children === 'string' || typeof children === 'number' ? (
            <span className="whitespace-nowrap leading-none">{children}</span>
          ) : (
            children
          )}
          {rightIcon && <span className="inline-flex items-center justify-center shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

