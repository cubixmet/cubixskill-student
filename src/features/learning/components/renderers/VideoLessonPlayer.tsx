import React, { useRef, useEffect } from 'react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveLessonMedia } from '../../utils/mediaResolver';

interface Props {
  lesson: CourseLesson;
}

export const VideoLessonPlayer: React.FC<Props> = ({ lesson }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = resolveLessonMedia(lesson);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [lesson.id]);

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-md border border-slate-800">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={media.thumbnailUrl}
        className="absolute inset-0 w-full h-full object-contain"
      >
        <source src={media.mediaUrl} type={media.mimeType || 'video/mp4'} />
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
};
