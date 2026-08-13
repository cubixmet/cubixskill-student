import React from 'react';
import { HardDrive, Server, FileText, MessageSquare, MessageCircle, ClipboardCheck, Building2 } from 'lucide-react';
import { useStorageAccountingStore, type StorageCategory } from '../../../stores/storage-accounting.store';
import { formatFileSize } from '../utils/resourceAccessResolver';
import { Card } from '../../../components/ui/Card';

interface Props {
  academyUuid?: string;
}

export const StorageUsageWidget: React.FC<Props> = ({ academyUuid = '550e8400-e29b-41d4-a716-446655440000' }) => {
  const getAcademyStorageSummary = useStorageAccountingStore((state) => state.getAcademyStorageSummary);

  const summary = getAcademyStorageSummary(academyUuid, 10737418240); // 10 GB limit
  const percentUsed = summary.storageLimitBytes
    ? Math.min(100, Math.round((summary.totalSizeBytes / summary.storageLimitBytes) * 100))
    : 0;

  const categoryLabels: Record<StorageCategory, { label: string; icon: React.ReactNode }> = {
    course_resources: { label: 'Course Resources', icon: <FileText className="w-4 h-4 text-blue-600 shrink-0" /> },
    lesson_resources: { label: 'Lesson Attachments', icon: <Server className="w-4 h-4 text-indigo-600 shrink-0" /> },
    discussion: { label: 'Discussion Uploads', icon: <MessageSquare className="w-4 h-4 text-purple-600 shrink-0" /> },
    personal_chat: { label: 'Personal Chat Files', icon: <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" /> },
    assignment_submissions: { label: 'Assignment Submissions', icon: <ClipboardCheck className="w-4 h-4 text-teal-600 shrink-0" /> },
    academy_assets: { label: 'Academy Branding & Media', icon: <Building2 className="w-4 h-4 text-amber-600 shrink-0" /> },
  };

  return (
    <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Academy Storage Accounting</h3>
            <p className="text-slate-500 text-[11px]">Centralized file storage tracking &amp; quota metrics</p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-extrabold text-sm text-slate-900 block">
            {formatFileSize(summary.totalSizeBytes)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            of {formatFileSize(summary.storageLimitBytes)} ({percentUsed}%)
          </span>
        </div>
      </div>

      {/* STORAGE PROGRESS BAR */}
      <div className="space-y-1">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(2, percentUsed)}%` }} />
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="space-y-2 pt-1">
        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Usage Breakdown</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(Object.keys(summary.categoryBreakdown) as StorageCategory[]).map((cat) => {
            const bytes = summary.categoryBreakdown[cat] || 0;
            const config = categoryLabels[cat];

            return (
              <div key={cat} className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {config.icon}
                  <span className="font-semibold text-slate-800 text-xs truncate">{config.label}</span>
                </div>
                <span className="font-bold text-slate-900 text-xs shrink-0">{formatFileSize(bytes)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
