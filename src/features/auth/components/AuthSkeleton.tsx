import React from 'react';

export const AuthSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--page-background, var(--surface-secondary))',
        color: 'var(--text-primary)',
      }}
      className="min-h-dvh w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0F17] font-sans"
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        className="w-full max-w-[380px] bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#263244] shadow-2xs space-y-4 animate-pulse text-center box-border"
      >
        <div
          style={{
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, var(--surface-secondary))',
          }}
          className="w-12 h-12 bg-slate-200 dark:bg-[#172033] rounded-2xl mx-auto"
        />
        <div
          style={{
            backgroundColor: 'color-mix(in srgb, var(--text-muted) 15%, var(--surface-secondary))',
          }}
          className="h-5 bg-slate-200 dark:bg-[#1E293B] rounded-md w-3/4 mx-auto"
        />
        <div
          style={{
            backgroundColor: 'color-mix(in srgb, var(--text-muted) 10%, var(--surface-secondary))',
          }}
          className="h-3 bg-slate-100 dark:bg-[#172033] rounded-md w-1/2 mx-auto"
        />
        <div className="pt-4 space-y-3">
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--text-muted) 10%, var(--surface-secondary))',
            }}
            className="h-10 bg-slate-100 dark:bg-[#172033] rounded-xl w-full"
          />
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--text-muted) 10%, var(--surface-secondary))',
            }}
            className="h-10 bg-slate-100 dark:bg-[#172033] rounded-xl w-full"
          />
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 15%, var(--surface-secondary))',
            }}
            className="h-10 bg-slate-200 dark:bg-[#1E293B] rounded-xl w-full"
          />
        </div>
      </div>
    </div>
  );
};
