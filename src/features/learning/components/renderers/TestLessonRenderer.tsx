import React from 'react';
import type { CourseLesson } from '../../../../stores/course.store';
import { AssessmentLessonRenderer } from './assessment/AssessmentLessonRenderer';

interface Props {
  lesson: CourseLesson;
  onMarkComplete?: () => Promise<void> | void;
}

export const TestLessonRenderer: React.FC<Props> = (props) => {
  return <AssessmentLessonRenderer {...props} />;
};
