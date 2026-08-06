import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type ToastMessage } from '../../stores/toast.store';

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast.duration || toast.duration === 0) return;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white',
    error: 'border-rose-200 bg-white',
    warning: 'border-amber-200 bg-white',
    info: 'border-sky-200 bg-white',
  };

  return (
    <div
      className={`w-full max-w-sm p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-right-4 font-sans text-xs ${
        borders[toast.type]
      }`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="font-semibold text-slate-900 leading-tight text-xs">{toast.title}</h4>
        {toast.description && (
          <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 flex flex-col gap-2.5 w-full max-w-sm px-4 sm:px-0 pointer-events-auto">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={removeToast} />
      ))}
    </div>
  );
};
