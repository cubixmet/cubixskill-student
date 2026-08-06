import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`p-8 md:p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4 max-w-md mx-auto font-sans text-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--theme-primary-soft,#EFF6FF)] border border-[var(--theme-primary,#2563EB)]/20 flex items-center justify-center mx-auto text-[var(--theme-primary,#2563EB)] shadow-2xs">
        {icon || <Inbox className="w-7 h-7" />}
      </div>

      <div className="space-y-1">
        <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">{description}</p>
      </div>

      {(actionText || secondaryActionText) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          {actionText && onAction && (
            <Button size="sm" onClick={onAction} className="font-semibold px-5" leftIcon={<Plus className="w-4 h-4" />}>
              {actionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button size="sm" variant="outline" onClick={onSecondaryAction} className="font-semibold">
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
