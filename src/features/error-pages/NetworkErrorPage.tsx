import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff, RotateCcw, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NetworkErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center font-sans text-xs">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
            NETWORK OFFLINE
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">No Internet Connection</h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            We are unable to reach the server. Please verify your internet connection or Wi-Fi settings and try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto font-semibold"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Retry Connection
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
