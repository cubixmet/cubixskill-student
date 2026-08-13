import React from 'react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveLessonMedia } from '../../utils/mediaResolver';

interface Props {
  lesson: CourseLesson;
}

export const StreamLessonPlayer: React.FC<Props> = ({ lesson }) => {
  const media = resolveLessonMedia(lesson);

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-md border border-slate-800">
      {media.mediaUrl.endsWith('.mp4') ? (
        <video
          controls
          playsInline
          preload="metadata"
          poster={media.thumbnailUrl}
          className="absolute inset-0 w-full h-full object-contain"
        >
          <source src={media.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <iframe
          src={media.mediaUrl}
          title={lesson.title}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};
