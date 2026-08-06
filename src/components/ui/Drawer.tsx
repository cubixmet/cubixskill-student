import React, { useEffect } from 'react';
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex transition-all duration-300 animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`relative z-10 w-full h-full bg-white shadow-2xl border-l border-slate-200 overflow-hidden font-sans text-xs text-slate-900 flex flex-col transition-all duration-300 animate-in ${positions[position]} ${sizes[size]}`}
      >
        {(title || subtitle) && (
          <div className="px-4 py-3.5 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
            <div>
              {title && <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-normal mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-4 md:p-6 overflow-y-auto hide-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};
