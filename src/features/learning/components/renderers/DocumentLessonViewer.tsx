import React from 'react';
import { Download, FileText } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveLessonMedia } from '../../utils/mediaResolver';
import { Button } from '../../../../components/ui/Button';

interface Props {
  lesson: CourseLesson;
}

export const DocumentLessonViewer: React.FC<Props> = ({ lesson }) => {
  const media = resolveLessonMedia(lesson);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 space-y-4">
      {/* DOCUMENT PREVIEW HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs text-slate-900 truncate block">{lesson.title}</span>
            <span className="text-[11px] text-slate-500 font-medium">Document Preview • PDF / Reference Guide</span>
          </div>
        </div>

        {media.allowDownload && (
          <a href={media.mediaUrl} download target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-4 h-4 shrink-0" />}
              className="w-full sm:w-auto font-semibold justify-center min-h-[40px] px-4 border-slate-300 text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              Download Document
            </Button>
          </a>
        )}
      </div>

      {/* EMBEDDED DOCUMENT VIEWER */}
      <div className="w-full min-h-[60vh] md:min-h-[75vh] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
        <iframe
          src={media.mediaUrl}
          title={lesson.title}
          className="w-full h-[65vh] md:h-[75vh] border-0"
        />
      </div>
    </div>
  );
};
