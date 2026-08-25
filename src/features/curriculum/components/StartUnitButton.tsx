import React from 'react';

interface StartUnitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const StartUnitButton: React.FC<StartUnitButtonProps> = ({
  disabled = false,
  leftIcon,
  children = 'Start Unit',
  className = '',
  style,
  onClick,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundColor: disabled
          ? 'var(--surface-secondary)'
          : 'var(--brand-primary)',
        color: disabled
          ? 'var(--text-muted)'
          : 'var(--brand-primary-foreground)',
        borderColor: disabled
          ? 'var(--border)'
          : 'var(--brand-primary)',
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[38px] px-3.5 py-1.5 rounded-lg border font-semibold text-xs
        transition-all duration-150 ease-in-out shrink-0 max-w-full
        focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1
        ${disabled ? '' : 'hover:opacity-90 active:scale-[0.98]'}
        ${className}
      `}
      {...props}
    >
      {leftIcon && <span className="shrink-0 text-current stroke-current">{leftIcon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
