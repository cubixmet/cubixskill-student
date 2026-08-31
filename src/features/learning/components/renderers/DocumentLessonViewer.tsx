import React from 'react';
import { Download, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveLessonDocumentSource } from '../../utils/mediaResolver';

interface Props {
  lesson: CourseLesson;
}

export const DocumentLessonViewer: React.FC<Props> = ({ lesson }) => {
  const source = resolveLessonDocumentSource(lesson);

  if (!source || !source.url) {
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
          Document Unavailable
        </h4>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs max-w-md mx-auto leading-relaxed">
          The document file attached to this lesson could not be loaded or is not available.
        </p>
      </div>
    );
  }

  const documentUrl = source.url;
  const canOpen = Boolean(documentUrl);
  const canDownload = Boolean(documentUrl) && source.allowDownload;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border)',
      }}
      className="w-full min-w-0 max-w-full rounded-2xl border p-3 sm:p-4 font-sans text-xs text-left box-border"
    >
      {/* COMPACT STUDENT DOCUMENT FILE CARD (NO INLINE PREVIEW SESSION) */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-xl"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
              color: 'var(--brand-primary)',
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          >
            <FileText className="w-5 h-5 stroke-current" />
          </div>
          <div className="min-w-0 flex-1">
            <span style={{ color: 'var(--brand-primary)' }} className="text-[10px] font-extrabold uppercase tracking-wider block">
              Document
            </span>
            <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold text-xs sm:text-sm truncate">
              {source.filename || lesson.title}
            </h4>
            <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-normal block truncate mt-0.5">
              {source.kind === 'pdf' ? 'PDF File' : source.mimeType || 'Reference Document'}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS ROW */}
        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto">
          {canOpen ? (
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'var(--brand-primary)',
                borderColor: 'var(--brand-primary)',
                color: 'var(--brand-primary-foreground, #FFFFFF)',
              }}
              className="w-full sm:w-auto font-medium min-h-[38px] px-4 rounded-xl border inline-flex items-center justify-center gap-1.5 text-xs shadow-xs transition-opacity hover:opacity-90 cursor-pointer shrink-0"
            >
              <ExternalLink className="w-4 h-4 shrink-0 stroke-current text-current" />
              <span>Open Document</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
              className="w-full sm:w-auto font-medium min-h-[38px] px-4 rounded-xl border inline-flex items-center justify-center gap-1.5 text-xs opacity-55 cursor-not-allowed shrink-0"
            >
              <ExternalLink className="w-4 h-4 shrink-0 stroke-current text-current" />
              <span>Open Document</span>
            </button>
          )}

          {canDownload ? (
            <a
              href={documentUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              className="w-full sm:w-auto font-medium min-h-[38px] px-4 rounded-xl border inline-flex items-center justify-center gap-1.5 text-xs transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 shrink-0 stroke-current text-current" />
              <span>Download</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
              className="w-full sm:w-auto font-medium min-h-[38px] px-4 rounded-xl border inline-flex items-center justify-center gap-1.5 text-xs opacity-55 cursor-not-allowed shrink-0"
            >
              <Download className="w-4 h-4 shrink-0 stroke-current text-current" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
