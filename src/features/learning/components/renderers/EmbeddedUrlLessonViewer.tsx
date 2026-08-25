import React, { useState } from 'react';
import { ExternalLink, Globe, AlertTriangle } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveLessonMedia, isEmbeddableUrl } from '../../utils/mediaResolver';
import { resolveVideoSource } from '../../utils/videoResolver';
import { VideoLessonPlayer } from './VideoLessonPlayer';
import { Button } from '../../../../components/ui/Button';

interface Props {
  lesson: CourseLesson;
}

export const EmbeddedUrlLessonViewer: React.FC<Props> = ({ lesson }) => {
  const videoSource = resolveVideoSource(lesson);
  const media = resolveLessonMedia(lesson);
  const canEmbed = isEmbeddableUrl(media.mediaUrl);
  const [embedBlocked, setEmbedBlocked] = useState(!canEmbed);

  // If the URL is actually a video (YouTube, Vimeo, direct MP4, HLS), use VideoLessonPlayer
  if (
    videoSource &&
    (videoSource.kind === 'youtube' ||
      videoSource.kind === 'vimeo' ||
      videoSource.kind === 'hls' ||
      videoSource.kind === 'direct')
  ) {
    return <VideoLessonPlayer lesson={lesson} />;
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 space-y-4 font-sans text-xs">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate block">{lesson.title}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate block">{media.mediaUrl}</span>
          </div>
        </div>

        <a href={media.mediaUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ExternalLink className="w-4 h-4 shrink-0" />}
            className="w-full sm:w-auto font-semibold justify-center min-h-[40px] px-4 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Open Resource
          </Button>
        </a>
      </div>

      {/* EMBEDDED IFRAME OR BLOCKED FALLBACK */}
      {embedBlocked ? (
        <div className="p-8 sm:p-12 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 text-center space-y-3 font-sans">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-2xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">This content cannot be displayed inside the lesson player</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The external provider security policy restricts iframe embedding. You can open the resource directly in a new tab to continue learning.
            </p>
          </div>
          <a href={media.mediaUrl} target="_blank" rel="noopener noreferrer" className="inline-block pt-2">
            <Button
              size="md"
              leftIcon={<ExternalLink className="w-4 h-4 shrink-0" />}
              className="font-semibold px-6 min-h-[44px] bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
            >
              Open External Resource
            </Button>
          </a>
        </div>
      ) : (
        <div className="w-full min-h-[60vh] md:min-h-[75vh] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative">
          <iframe
            src={media.mediaUrl}
            title={lesson.title}
            onError={() => setEmbedBlocked(true)}
            className="w-full h-[65vh] md:h-[75vh] border-0"
          />
        </div>
      )}
    </div>
  );
};
