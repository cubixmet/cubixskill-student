import React from 'react';
import { Pin } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export const AnnouncementsPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto">
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs">
        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Course Announcements</h1>
        <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-1">
          Stay informed with official updates, schedule changes, and news from your instructor.
        </p>
      </Card>

      <div className="space-y-4">
        <Card padding="md" className="bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm" className="flex items-center gap-1">
                <Pin className="w-3 h-3" /> PINNED
              </Badge>
              <h3 className="font-extrabold text-sm text-slate-900">React 19 Live Masterclass Schedule &amp; Q&amp;A Session</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Posted: Aug 5, 2026</span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Dear Students, our upcoming live class on React 19 Compiler Architecture is scheduled for this Thursday at 6:00 PM IST. Please review Module 3 prior to joining.
          </p>
        </Card>
      </div>
    </div>
  );
};
