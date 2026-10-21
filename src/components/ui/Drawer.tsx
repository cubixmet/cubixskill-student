import React from 'react';
import { createPortal } from 'react-dom';
import { useOverlay } from '../../hooks/useOverlay';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'right',
  size = 'md',
}) => {
  const panelRef = useOverlay(isOpen, onClose);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-xl',
  };

  const positions = {
    right: 'right-0 translate-x-0 slide-in-from-right',
    left: 'left-0 translate-x-0 slide-in-from-left',
  };

  return createPortal(
    <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex transition-all duration-300 animate-in fade-in ${position === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="absolute inset-0" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        tabIndex={-1}
        className={`relative z-10 w-full h-dvh bg-white dark:bg-[#111827] shadow-2xl border-l border-slate-200 overflow-hidden font-sans text-sm text-slate-900 dark:text-slate-100 flex flex-col transition-all duration-300 animate-in ${positions[position]} ${sizes[size]}`}
      >
        {(title || subtitle) && (
          <div className="px-4 py-3.5 md:px-6 md:py-4 border-b dark:border-[#263244] border-slate-100 flex items-center justify-between shrink-0 bg-white dark:bg-[#111827] sticky top-0 z-10">
            <div>
              {title && <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-normal mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-4 md:p-6 min-h-0 overflow-y-auto hide-scrollbar flex-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>,
    document.body
  );
};

