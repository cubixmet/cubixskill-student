import React from 'react';
import type { CourseLesson } from '../../../../stores/course.store';
import { VideoLessonPlayer } from './VideoLessonPlayer';

interface Props {
  lesson: CourseLesson;
}

export const StreamLessonPlayer: React.FC<Props> = ({ lesson }) => {
  return <VideoLessonPlayer lesson={lesson} />;
};
