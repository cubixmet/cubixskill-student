import React, { useState, useEffect } from 'react';
import { toast } from '../../stores/toast.store';
import { WifiOff } from 'lucide-react';

export const NetworkStatusHandler: React.FC = () => {
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Internet connection restored.', 'You are back online.', 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error('Network Connection Lost', 'You are currently offline. Please check your internet connection.', 6000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-rose-600 text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md animate-in slide-in-from-top">
      <WifiOff className="w-4 h-4 text-white shrink-0" />
      <span>Network Connection Lost — You are operating in offline mode.</span>
    </div>
  );
};
