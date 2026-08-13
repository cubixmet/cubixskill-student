import React, { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveLessonMedia } from '../../utils/mediaResolver';

interface Props {
  lesson: CourseLesson;
}

export const ImageLessonViewer: React.FC<Props> = ({ lesson }) => {
  const media = resolveLessonMedia(lesson);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center min-h-[220px]">
        {hasError ? (
          <div className="p-8 text-center space-y-2 text-slate-400">
            <p className="text-xs font-semibold">Could not load image resource.</p>
          </div>
        ) : (
          <>
            <img
              src={media.mediaUrl}
              alt={lesson.title}
              onError={() => setHasError(true)}
              className="w-full h-auto max-h-[70vh] object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
              onClick={() => setZoomOpen(true)}
            />
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-semibold text-xs backdrop-blur-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <ZoomIn className="w-4 h-4" />
              <span>Tap to Zoom</span>
            </button>
          </>
        )}
      </div>

      {/* IMAGE ZOOM MODAL */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex flex-col items-center justify-center font-sans">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[85vh] overflow-auto rounded-2xl">
            <img src={media.mediaUrl} alt={lesson.title} className="w-full h-auto object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
