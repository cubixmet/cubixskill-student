import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading content. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-8 text-center bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-3 max-w-md mx-auto font-sans text-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center mx-auto text-rose-600 shadow-2xs">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-bold text-rose-950">{title}</h4>
        <p className="text-xs text-rose-800/80 font-normal leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            size="sm"
            variant="danger"
            onClick={onRetry}
            className="font-semibold px-4"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
