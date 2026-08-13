import React, { useState } from 'react';
import { Eye, Download, FileText, Image as ImageIcon, FileArchive, Code, Lock } from 'lucide-react';
import type { CourseResource } from '../../../stores/resource.store';
import type { CourseEnrollment } from '../../../stores/enrollment.store';
import { resolveResourceAccess, formatFileSize } from '../utils/resourceAccessResolver';
import { ResourceViewerModal } from './ResourceViewerModal';
import { Button } from '../../../components/ui/Button';

interface Props {
  resource: CourseResource;
  enrollment?: CourseEnrollment;
}

export const LessonResourceCard: React.FC<Props> = ({ resource, enrollment }) => {
  const access = resolveResourceAccess({ resource, enrollment });
  const [viewerOpen, setViewerOpen] = useState(false);

  const getFileIcon = () => {
    if (resource.mimeType?.startsWith('image/') || resource.fileName.match(/\.(png|jpe?g|svg)$/i)) {
      return <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />;
    }
    if (resource.fileName.endsWith('.zip') || resource.fileName.endsWith('.tar.gz')) {
      return <FileArchive className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
  };

  return (
    <>
      <div className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans text-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            {getFileIcon()}
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{resource.title}</h4>
              {!access.canDownload && access.canView && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700 uppercase tracking-wide">
                  View Only
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="truncate max-w-[200px]">{resource.fileName}</span>
              <span>•</span>
              <span>{formatFileSize(resource.fileSize)}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
          {access.canView ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewerOpen(true)}
              leftIcon={<Eye className="w-4 h-4 shrink-0 text-slate-700" />}
              className="w-full sm:w-auto font-semibold px-4 min-h-[38px] border-slate-300 text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              View
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Lock className="w-3.5 h-3.5" /> Restricted
            </span>
          )}

          {access.canDownload && (
            <a href={resource.fileUrl} download={resource.fileName} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                size="sm"
                leftIcon={<Download className="w-4 h-4 shrink-0" />}
                className="w-full sm:w-auto font-semibold px-4 min-h-[38px] bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
              >
                Download
              </Button>
            </a>
          )}
        </div>
      </div>

      {viewerOpen && (
        <ResourceViewerModal
          resource={resource}
          onClose={() => setViewerOpen(false)}
          canDownload={access.canDownload}
        />
      )}
    </>
  );
};
