import React, { useState, useRef, useEffect } from 'react';

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: 'left' | 'right';
}

export const Popover: React.FC<PopoverProps> = ({ trigger, content, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 font-sans text-xs animate-in fade-in zoom-in-95 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
