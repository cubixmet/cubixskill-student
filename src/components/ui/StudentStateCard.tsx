import React from 'react';
import { AlertCircle, AlertTriangle, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface StudentStateCardProps {
  variant?: 'warning' | 'error' | 'empty';
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionPath?: string;
  onSecondaryAction?: () => void;
}

export const StudentStateCard: React.FC<StudentStateCardProps> = ({
  variant = 'warning',
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
  secondaryActionLabel,
  secondaryActionPath,
  onSecondaryAction,
}) => {
  const IconComponent = variant === 'empty' ? Inbox : variant === 'error' ? AlertTriangle : AlertCircle;
  const iconColor = variant === 'empty' ? 'text-[#64748B] dark:text-[#94A3B8]' : variant === 'error' ? 'text-red-500' : 'text-[#F59E0B]';
  const iconBg = variant === 'empty' ? 'bg-slate-100 dark:bg-[#1E293B]' : variant === 'error' ? 'bg-red-500/10' : 'bg-[#F59E0B]/10';

  return (
    <div className="w-full max-w-[680px] min-h-[220px] mx-auto flex flex-col items-center justify-center text-center gap-3 rounded-2xl border px-4 py-8 sm:px-6 bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#263244] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>

      <div className="space-y-1 max-w-md">
        <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          {description}
        </p>
      </div>

      {((actionLabel && (actionPath || onAction)) || (secondaryActionLabel && (secondaryActionPath || onSecondaryAction))) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          {actionLabel && (actionPath || onAction) && (
            actionPath ? (
              <Link to={actionPath} className="block w-full sm:w-auto">
                <Button
                  size="md"
                  className="w-full sm:w-auto min-h-[42px] px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl text-xs shadow-xs cursor-pointer justify-center"
                >
                  {actionLabel}
                </Button>
              </Link>
            ) : (
              <Button
                size="md"
                onClick={onAction}
                className="w-full sm:w-auto min-h-[42px] px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl text-xs shadow-xs cursor-pointer justify-center"
              >
                {actionLabel}
              </Button>
            )
          )}

          {secondaryActionLabel && (secondaryActionPath || onSecondaryAction) && (
            secondaryActionPath ? (
              <Link to={secondaryActionPath} className="block w-full sm:w-auto">
                <Button
                  size="md"
                  variant="outline"
                  className="w-full sm:w-auto min-h-[42px] px-5 font-medium rounded-xl text-xs shadow-xs cursor-pointer justify-center"
                >
                  {secondaryActionLabel}
                </Button>
              </Link>
            ) : (
              <Button
                size="md"
                variant="outline"
                onClick={onSecondaryAction}
                className="w-full sm:w-auto min-h-[42px] px-5 font-medium rounded-xl text-xs shadow-xs cursor-pointer justify-center"
              >
                {secondaryActionLabel}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};
