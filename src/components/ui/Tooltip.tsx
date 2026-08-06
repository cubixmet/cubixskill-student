import React, { useState } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [show, setShow] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-50 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 pointer-events-none ${positions[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
