import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table' | 'chat';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  count = 1,
  className = '',
  ...props
}) => {
  const base = 'animate-pulse bg-slate-200/80 rounded-xl';

  if (variant === 'card') {
    return (
      <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
        <div className="h-32 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-4 bg-slate-200 rounded-md w-3/4 animate-pulse" />
        <div className="h-3 bg-slate-200 rounded-md w-1/2 animate-pulse" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="h-8 bg-slate-200 rounded-xl animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <div className="space-y-3 p-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="h-16 bg-slate-200 rounded-2xl w-2/3 animate-pulse" />
        </div>
        <div className="flex gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="h-12 bg-slate-200 rounded-2xl w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    return <div className={`${base} rounded-full ${className}`} {...props} />;
  }

  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, idx) => (
        <div key={idx} className={`${base} ${className}`} {...props} />
      ))}
    </div>
  );
};
