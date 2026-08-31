import React, { useState } from 'react';
import { Volume2, AlertCircle } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveMediaUrl } from '../../../../services/apiClient';
import { useThemeStore } from '../../../../stores/theme.store';

interface Props {
  lesson: CourseLesson;
}

export const AudioLessonPlayer: React.FC<Props> = ({ lesson }) => {
  const { resolvedTheme } = useThemeStore();
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  const anyLesson = lesson as any;
  const content: any = lesson.content || {};

  const rawUrl = (
    anyLesson.audio_url ||
    anyLesson.audioUrl ||
    anyLesson.external_url ||
    anyLesson.externalUrl ||
    content.audioUrl ||
    content.externalUrl ||
    content.mediaUrl ||
    content.fileUrl ||
    lesson.mediaUrl ||
    anyLesson.media_url ||
    anyLesson.content_url ||
    ''
  ).trim();

  const audioUrl = resolveMediaUrl(rawUrl);

  if (!audioUrl) {
    return (
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
        className="w-full min-w-0 max-w-full p-6 border rounded-2xl text-center space-y-2 font-sans text-xs box-border"
      >
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold text-xs">
          Audio Unavailable
        </h4>
        <p style={{ color: 'var(--text-muted)' }} className="text-[11px]">
          The audio file for this lesson could not be loaded.
        </p>
      </div>
    );
  }

  if (hasPlaybackError) {
    return (
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
        className="w-full min-w-0 max-w-full p-6 border rounded-2xl space-y-3 font-sans text-xs box-border"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-xs truncate">
              Audio preview could not be played.
            </span>
          </div>
          {audioUrl.startsWith('http') && (
            <a
              href={audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--brand-primary)',
              }}
              className="px-3 py-1.5 rounded-xl border text-[11px] font-semibold hover:opacity-90 transition-opacity shrink-0 inline-flex items-center gap-1"
            >
              <span>Open Audio</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--border)',
      }}
      className="audio-player-shell w-full min-w-0 max-w-full border rounded-2xl p-4 sm:p-6 space-y-4 font-sans text-xs text-left box-border"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          style={{
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
            color: 'var(--brand-primary)',
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        >
          <Volume2 className="w-5 h-5 stroke-current" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold text-xs truncate">
            {lesson.title}
          </h4>
          <span style={{ color: 'var(--text-muted)' }} className="text-[10px] block truncate font-normal">
            Audio Lesson
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        className="w-full min-w-0 max-w-full border rounded-xl p-2.5 sm:p-3 box-border"
      >
        <audio
          controls
          preload="metadata"
          onError={() => setHasPlaybackError(true)}
          style={{
            colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light',
          }}
          className="block w-full min-w-0 max-w-full h-9"
          src={audioUrl}
        >
          Your browser does not support HTML5 audio playback.
        </audio>
      </div>
    </div>
  );
};
