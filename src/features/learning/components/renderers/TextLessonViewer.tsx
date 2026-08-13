import React from 'react';
import { AlignLeft } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';

interface Props {
  lesson: CourseLesson;
}

export const TextLessonViewer: React.FC<Props> = ({ lesson }) => {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 space-y-6 font-sans text-xs max-w-4xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <AlignLeft className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">{lesson.title}</h2>
          <span className="text-[11px] text-slate-500 font-medium">Text &amp; Concept Reading Lesson</span>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="prose prose-slate max-w-none space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed break-words">
        {lesson.content ? (
          <div className="space-y-3 whitespace-pre-line">{lesson.content}</div>
        ) : (
          <div className="space-y-4">
            <p className="font-semibold text-slate-900">
              Welcome to this comprehensive technical reading unit on {lesson.title}.
            </p>
            <p>
              In modern distributed application architecture, state isolation and compiler-driven optimizations ensure peak execution performance. Review the key concepts below to prepare for upcoming assignments.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <span className="text-blue-600 font-bold">// Key Takeaway</span>
              <p>Always isolate transient UI state before committing to global Zustand store persistence.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
