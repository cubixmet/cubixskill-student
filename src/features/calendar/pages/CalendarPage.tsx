import React from 'react';
import { Video, FileCheck, HelpCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export const CalendarPage: React.FC = () => {
  const events = [
    { date: 'Aug 8, 2026', title: 'React 19 Masterclass Live Class', type: 'Live Class', icon: Video, color: 'text-rose-600' },
    { date: 'Aug 9, 2026', title: 'Zustand Store Assignment Due', type: 'Assignment', icon: FileCheck, color: 'text-amber-600' },
    { date: 'Aug 12, 2026', title: 'Module 3 Architecture Quiz', type: 'Quiz', icon: HelpCircle, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto">
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs">
        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Course Calendar &amp; Deadlines</h1>
        <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-1">
          Keep track of scheduled live sessions, assignment due dates, and module releases.
        </p>
      </Card>

      <div className="space-y-3">
        {events.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <Card key={idx} padding="md" className="bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 ${evt.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">{evt.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Date: {evt.date}</span>
                </div>
              </div>

              <Badge variant="neutral" size="sm">{evt.type}</Badge>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

