import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  mobileVariant?: 'sheet' | 'fullscreen' | 'dialog';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  mobileVariant = 'dialog',
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4',
  };

  const mobileStyles = {
    dialog: 'rounded-2xl mx-3 my-auto max-h-[90vh]',
    sheet: 'rounded-t-2xl sm:rounded-2xl mt-auto sm:my-auto max-h-[85vh]',
    fullscreen: 'h-full w-full rounded-none sm:rounded-2xl sm:h-auto sm:max-h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 transition-all duration-200 animate-in fade-in">
      {/* BACKDROP CLICK */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* DIALOG CARD */}
      <div
        className={`relative z-10 w-full bg-white shadow-2xl border border-slate-200/90 overflow-hidden font-sans text-xs text-slate-900 flex flex-col transition-all duration-200 animate-in zoom-in-95 ${maxWidths[maxWidth]} ${mobileStyles[mobileVariant]}`}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="px-4 py-3.5 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
            <div>
              {title && <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-normal mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto hide-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};
