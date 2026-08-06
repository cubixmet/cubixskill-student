import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center font-sans text-xs">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-2xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 font-mono">
            ERROR 403
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Forbidden</h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            You do not have permission to view this course or resource. Please check your enrollment status or contact support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto font-semibold"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/student/academies')}
            className="w-full sm:w-auto font-semibold"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Go to Academies
          </Button>
        </div>
      </div>
    </div>
  );
};
