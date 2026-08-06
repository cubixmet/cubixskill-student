import React from 'react';

export const AuthSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-4 animate-pulse text-center">
        <div className="w-12 h-12 bg-slate-200 rounded-2xl mx-auto" />
        <div className="h-5 bg-slate-200 rounded-md w-3/4 mx-auto" />
        <div className="h-3 bg-slate-100 rounded-md w-1/2 mx-auto" />
        <div className="pt-4 space-y-3">
          <div className="h-10 bg-slate-100 rounded-xl w-full" />
          <div className="h-10 bg-slate-100 rounded-xl w-full" />
          <div className="h-10 bg-slate-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
};
