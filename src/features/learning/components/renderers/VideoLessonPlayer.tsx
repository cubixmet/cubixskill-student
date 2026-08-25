import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveVideoSource } from '../../utils/videoResolver';
import { Button } from '../../../../components/ui/Button';

interface Props {
  lesson: CourseLesson;
}

export const VideoLessonPlayer: React.FC<Props> = ({ lesson }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoSource = resolveVideoSource(lesson);

  useEffect(() => {
    setVideoError(null);
    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch (_) {
          // Cleanup error handling
        }
      }
    };
  }, [lesson.id, lesson.mediaUrl, lesson.externalUrl]);

  if (!videoSource || !videoSource.url) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-400" />
        <h4 className="font-semibold text-xs text-slate-200">Video Source Unavailable</h4>
        <p className="text-[11px] text-slate-400 max-w-sm">
          No valid video media file or playback URL was provided for this unit.
        </p>
      </div>
    );
  }

  if (videoError) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <h4 className="font-semibold text-xs text-slate-200">Unable to Play Video</h4>
        <p className="text-[11px] text-slate-400 max-w-sm">{videoError}</p>
        {videoSource.url.startsWith('http') && (
          <a href={videoSource.url} target="_blank" rel="noopener noreferrer" className="pt-2">
            <Button size="sm" variant="outline" leftIcon={<ExternalLink className="w-4 h-4" />}>
              Open External Video
            </Button>
          </a>
        )}
      </div>
    );
  }

  // Embed Renderers (YouTube / Vimeo / Wistia / Custom Embed IFrame)
  if (
    videoSource.kind === 'youtube' ||
    videoSource.kind === 'vimeo' ||
    videoSource.kind === 'wistia' ||
    videoSource.kind === 'embed'
  ) {
    const embedSrc = videoSource.embedUrl || videoSource.url;
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-md border border-slate-800">
        <iframe
          key={`${lesson.id}-${embedSrc}`}
          src={embedSrc}
          title={lesson.title || 'Video Lesson'}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  // Direct HTML5 Video & HLS Stream Player
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-md border border-slate-800">
      <video
        key={`${lesson.id}-${videoSource.url}`}
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={lesson.thumbnailUrl}
        onLoadedMetadata={() => setVideoError(null)}
        onError={() => setVideoError('Unable to load or play this media stream.')}
        className="absolute inset-0 w-full h-full object-contain"
      >
        <source src={videoSource.url} type={videoSource.mimeType || 'video/mp4'} />
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
};
