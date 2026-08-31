import React, { useState } from 'react';
import { ZoomIn, X, AlertCircle } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveLessonMedia } from '../../utils/mediaResolver';

interface Props {
  lesson: CourseLesson;
}

export const ImageLessonViewer: React.FC<Props> = ({ lesson }) => {
  const media = resolveLessonMedia(lesson);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!media.mediaUrl || hasError) {
    return (
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
        className="w-full min-w-0 max-w-full p-6 sm:p-8 border rounded-2xl text-center space-y-3 font-sans text-xs box-border"
      >
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto shrink-0" />
        <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">
          Image Unavailable
        </h4>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs max-w-md mx-auto leading-relaxed">
          The image resource attached to this lesson could not be loaded or is unavailable.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
      className="w-full min-w-0 max-w-full rounded-2xl border p-3 sm:p-4 space-y-3 font-sans text-xs box-border"
    >
      {/* INNER MEDIA STAGE */}
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
        className="relative group rounded-xl overflow-hidden border flex items-center justify-center min-h-[220px] max-h-[calc(100dvh-180px)] box-border"
      >
        <img
          src={media.mediaUrl}
          alt={lesson.title}
          onError={() => setHasError(true)}
          className="block w-full h-auto max-w-full max-h-[calc(100dvh-180px)] object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.005]"
          onClick={() => setZoomOpen(true)}
        />
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          className="absolute bottom-3 right-3 min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] shrink-0"
        >
          <ZoomIn className="w-4 h-4 shrink-0 stroke-current text-current" />
          <span>Tap to Zoom</span>
        </button>
      </div>

      {/* IMAGE ZOOM MODAL */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-4 flex flex-col items-center justify-center font-sans">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer shadow-lg hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            <X className="w-5 h-5 stroke-current" />
          </button>
          <div className="max-w-5xl max-h-[85vh] overflow-auto rounded-2xl p-2 bg-black/40 border border-slate-700/50">
            <img
              src={media.mediaUrl}
              alt={lesson.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
