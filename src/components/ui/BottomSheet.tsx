import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col justify-end transition-all duration-300 animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full bg-white rounded-t-2xl max-h-[85vh] shadow-2xl border-t border-slate-200 overflow-hidden font-sans text-xs text-slate-900 flex flex-col transition-all duration-300 animate-in slide-in-from-bottom">
        {/* DRAG HANDLE BAR */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {title && (
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-4 overflow-y-auto hide-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};
