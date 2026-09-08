import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-5 md:p-8',
  };

  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xs text-[var(--text-primary)] ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
