import React from 'react';
import { useAcademyStore } from '../../../stores/academy.store';

interface LearningProgressCardProps {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  subtitle?: string;
  className?: string;
}

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  completedLessons,
  totalLessons,
  percentage,
  subtitle = 'Overall course completion metrics',
  className = '',
}) => {
  const activeAcademy = useAcademyStore((state) => state.activeAcademy);
  if (activeAcademy?.features?.student_reports === false) {
    return null;
  }

  const percentVal = Math.min(100, Math.max(0, Math.round(percentage || 0)));
  const remaining = Math.max(0, totalLessons - completedLessons);

  return (
    <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-[14px] p-[16px] sm:p-[22px_24px] space-y-4 text-left ${className}`}>
      {/* HEADER ROW */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-[#263244] pb-3.5">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Your Learning Progress
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">
            {subtitle}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span style={{ color: 'var(--brand-primary)' }} className="text-[26px] sm:text-[30px] font-semibold leading-none block">
            {percentVal}%
          </span>
        </div>
      </div>

      {/* PROGRESS TRACK */}
      <div className="space-y-2">
        <div
          role="progressbar"
          aria-valuenow={percentVal}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-[12px] rounded-full bg-slate-200 dark:bg-[#263244] overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentVal}%`, backgroundColor: 'var(--brand-primary)' }}
          />
        </div>

        {/* FOOTER METRICS */}
        <div className="flex items-center justify-between text-[11px] font-normal text-slate-500 dark:text-[#94A3B8]">
          <span>{completedLessons} of {totalLessons} lessons completed</span>
          <span style={{ color: 'var(--brand-primary)' }} className="font-medium">{remaining} remaining</span>
        </div>
      </div>
    </div>
  );
};
