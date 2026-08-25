import React from 'react';
import { Volume2, AlertCircle } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveMediaUrl } from '../../../../services/apiClient';

interface Props {
  lesson: CourseLesson;
}

export const AudioLessonPlayer: React.FC<Props> = ({ lesson }) => {
  const rawUrl = (
    lesson.mediaUrl ||
    (lesson as any).audio_url ||
    (lesson as any).media_url ||
    (lesson as any).content_url ||
    lesson.externalUrl ||
    ''
  ).trim();

  const audioUrl = resolveMediaUrl(rawUrl);

  if (!audioUrl) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-2xl text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">Audio Unavailable</h4>
        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">The audio file for this unit is not available.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-2xl p-6 space-y-4 font-sans text-xs text-left">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <Volume2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">{lesson.title}</h4>
          <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">Audio Lesson</span>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-xl p-3">
        <audio
          controls
          src={audioUrl}
          className="w-full min-w-0"
          preload="metadata"
        >
          Your browser does not support HTML5 audio playback.
        </audio>
      </div>
    </div>
  );
};
