import React, { useEffect } from 'react';
import { CheckCircle2, CircleAlert, TriangleAlert, Info, X } from 'lucide-react';
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
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <CircleAlert className="w-4 h-4 text-rose-400 shrink-0" />,
    warning: <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-800/80 bg-slate-900 text-white',
    error: 'border-rose-800/80 bg-slate-900 text-white',
    warning: 'border-amber-800/80 bg-slate-900 text-white',
    info: 'border-sky-800/80 bg-slate-900 text-white',
  };

  return (
    <div
      className={`w-[calc(100vw-24px)] sm:w-auto max-w-md p-3 sm:p-3.5 rounded-2xl border shadow-xl flex items-start gap-2.5 transition-all duration-300 animate-in fade-in slide-in-from-top-4 font-sans text-xs ${
        borders[toast.type]
      }`}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white leading-tight text-xs break-words">{toast.title}</h4>
        {toast.description && (
          <p className="text-[11px] text-slate-300 font-normal mt-0.5 leading-relaxed break-words">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0"
        aria-label="Dismiss toast"
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 flex flex-col gap-2.5 w-[calc(100vw-24px)] sm:w-auto max-w-md pointer-events-auto">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={removeToast} />
      ))}
    </div>
  );
};

