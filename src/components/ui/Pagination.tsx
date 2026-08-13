import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-between gap-3 pt-4 border-t border-slate-100 font-sans text-xs ${className}`}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <span className="font-semibold text-slate-600 text-xs">
        Page <strong className="font-semibold text-slate-900">{currentPage}</strong> of{' '}
        <strong className="font-semibold text-slate-900">{totalPages}</strong>
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </button>
    </nav>
  );
};
