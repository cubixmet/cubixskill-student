import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoCloseDuration?: number; // ms
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  dismissible = true,
  onDismiss,
  autoCloseDuration,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoCloseDuration || autoCloseDuration === 0) return;
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDuration);
    return () => clearTimeout(timer);
  }, [autoCloseDuration]);

  const handleClose = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
  };

  const styles = {
    success: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
    error: 'bg-rose-50/90 border-rose-200 text-rose-950',
    warning: 'bg-amber-50/90 border-amber-200 text-amber-950',
    info: 'bg-sky-50/90 border-sky-200 text-sky-950',
  };

  return (
    <div
      className={`p-3.5 md:p-4 rounded-2xl border shadow-2xs flex items-start gap-3 transition-all duration-300 font-sans text-xs md:text-sm animate-in fade-in ${styles[type]} ${className}`}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-xs md:text-sm leading-tight mb-0.5">{title}</h4>}
        <div className="font-normal leading-relaxed text-xs opacity-90">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-black/5 transition-all cursor-pointer text-current opacity-60 hover:opacity-100 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
