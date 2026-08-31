import React from 'react';
import { AlignLeft } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { RichTextRenderer } from '../../../../components/ui/RichTextRenderer';

interface Props {
  lesson: CourseLesson;
}

export const TextLessonViewer: React.FC<Props> = ({ lesson }) => {
  const rawContent = lesson.content || (lesson as any).textContent || (lesson as any).body || (lesson as any).article || '';

  if (!rawContent || !rawContent.trim()) {
    return (
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
        className="w-full min-w-0 max-w-full p-6 sm:p-8 border rounded-2xl text-center space-y-3 font-sans text-xs box-border"
      >
        <AlignLeft className="w-8 h-8 text-purple-500 mx-auto shrink-0" />
        <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">
          Content Unavailable
        </h4>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs max-w-md mx-auto leading-relaxed">
          The text content for this lesson is not available.
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
      className="w-full rounded-2xl border p-5 sm:p-8 space-y-6 font-sans text-xs max-w-4xl mx-auto box-border"
    >
      {/* HEADER BAR */}
      <div style={{ borderColor: 'var(--border)' }} className="flex items-center gap-3 border-b pb-4">
        <div
          style={{
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
            color: 'var(--brand-primary)',
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        >
          <AlignLeft className="w-5 h-5 stroke-current" />
        </div>
        <div>
          <h2 style={{ color: 'var(--text-primary)' }} className="text-base sm:text-lg font-extrabold leading-tight">
            {lesson.title}
          </h2>
          <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-medium">
            Text &amp; Concept Reading Lesson
          </span>
        </div>
      </div>

      {/* BODY CONTENT RENDERED SAFELY AS RICH TEXT */}
      <RichTextRenderer html={rawContent} />
    </div>
  );
};
