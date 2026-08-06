import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center font-sans text-xs">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 font-mono">
            ERROR 401
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Authentication Required</h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Your session has expired or you are not signed in. Please log in to continue accessing your student portal.
          </p>
        </div>

        <div className="pt-2">
          <Button
            size="sm"
            onClick={() => navigate('/login')}
            className="w-full font-semibold"
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Log In to Student Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
