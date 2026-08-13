import React from 'react';
import {
  CheckCircle2,
  PlayCircle,
  Circle,
  Lock,
  Clock,
  AlertCircle,
} from 'lucide-react';

export type LessonStatusType =
  | 'completed'
  | 'in_progress'
  | 'available'
  | 'unlocked'
  | 'locked'
  | 'submitted'
  | 'awaiting_review'
  | 'failed'
  | 'changes_requested';

interface LessonStatusBadgeProps {
  status: LessonStatusType;
  customLabel?: string;
  className?: string;
}

export const LessonStatusBadge: React.FC<LessonStatusBadgeProps> = ({
  status,
  customLabel,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          label: customLabel || 'Completed',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconColor: 'text-emerald-600',
        };
      case 'in_progress':
        return {
          icon: PlayCircle,
          label: customLabel || 'In Progress',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          iconColor: 'text-blue-600',
        };
      case 'available':
      case 'unlocked':
        return {
          icon: Circle,
          label: customLabel || 'Available',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          iconColor: 'text-slate-500',
        };
      case 'locked':
        return {
          icon: Lock,
          label: customLabel || 'Locked',
          bg: 'bg-slate-100 text-slate-500 border-slate-200',
          iconColor: 'text-slate-400',
        };
      case 'submitted':
        return {
          icon: CheckCircle2,
          label: customLabel || 'Submitted',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconColor: 'text-emerald-600',
        };
      case 'awaiting_review':
        return {
          icon: Clock,
          label: customLabel || 'Awaiting Review',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600',
        };
      case 'failed':
      case 'changes_requested':
        return {
          icon: AlertCircle,
          label: customLabel || (status === 'failed' ? 'Failed' : 'Changes Requested'),
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          iconColor: 'text-rose-600',
        };
      default:
        return {
          icon: Circle,
          label: customLabel || 'Available',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          iconColor: 'text-slate-500',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium h-7 max-h-7 shrink-0 ${config.bg} ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${config.iconColor}`} />
      <span className="whitespace-nowrap truncate min-w-0">{config.label}</span>
    </span>
  );
};
