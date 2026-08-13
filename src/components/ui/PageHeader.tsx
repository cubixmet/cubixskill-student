import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  showBack?: boolean;
  backUrl?: string;
  onBack?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  showBack = false,
  backUrl,
  onBack,
  badge,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans pb-2 ${className}`}>
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {showBack && (
            <button
              type="button"
              onClick={handleBackClick}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {badge}
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug break-words min-w-0">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-xs text-slate-500 font-normal leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">{action}</div>}
    </div>
  );
};
