import React from 'react';
import { Video } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  type LiveClass,
  useLiveClassStore,
} from '../../../stores/live-class.store';
import {
  resolveLiveClassStatus,
  formatLiveClassDate,
  formatLiveClassTime,
} from '../utils/liveClassResolver';

interface LiveClassCardProps {
  liveClass?: LiveClass;
  onJoin?: (liveClass: LiveClass) => void;
  className?: string;
}

export const LiveClassCard: React.FC<LiveClassCardProps> = ({
  liveClass,
  onJoin,
  className = '',
}) => {
  if (!liveClass) return null;

  const status = resolveLiveClassStatus(liveClass);
  const isLive = status === 'LIVE_NOW';

  return (
    <Card
      padding="none"
      className={`bg-white text-slate-900 border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-5 font-sans ${className}`}
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Header Row: Badge & Date/Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-rose-600 text-white tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                <span>LIVE NOW</span>
              </span>
            ) : (
              <Badge variant="info" size="sm" className="font-semibold text-[11px] rounded-lg">
                Upcoming Live Session
              </Badge>
            )}
          </div>

          <span className="text-xs sm:text-sm font-normal text-slate-500">
            {formatLiveClassDate(liveClass.scheduledStartAt)} • {formatLiveClassTime(liveClass.scheduledStartAt)}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1 min-w-0">
          <h3 className="font-semibold text-[18px] sm:text-[21px] text-[#000000] leading-snug break-words">
            {liveClass.title}
          </h3>
          {liveClass.description && (
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {liveClass.description}
            </p>
          )}
        </div>

        {/* Join CTA Button */}
        <div>
          <Button
            size="md"
            onClick={() => onJoin?.(liveClass)}
            leftIcon={<Video className="h-4 w-4 shrink-0 text-white" />}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl font-medium text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white border-0 cursor-pointer shadow-xs max-w-full"
          >
            {isLive ? 'Join Live Class Now' : 'View Live Sessions'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
