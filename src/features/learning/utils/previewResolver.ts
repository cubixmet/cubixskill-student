import React from 'react';
import {
  PlayCircle,
  Radio,
  Image as ImageIcon,
  FileText,
  Globe,
  AlignLeft,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react';
import type { CourseLesson, LessonType } from '../../../stores/course.store';
import { resolveLessonMedia, resolveLessonType } from './mediaResolver';

export interface LessonPreviewInfo {
  type: LessonType;
  thumbnailUrl: string;
  label: string;
  allowDownload?: boolean;
}

export function resolveLessonPreview(lesson: CourseLesson): LessonPreviewInfo {
  const type = resolveLessonType(lesson);
  const media = resolveLessonMedia(lesson);

  const typeLabels: Record<LessonType, string> = {
    video: 'Video Lesson',
    stream: 'Stream Video',
    image: 'Image Diagram',
    document: 'Document / PDF',
    url: 'Embedded Resource',
    text: 'Reading Lesson',
    test: 'Quiz Assessment',
    assignment: 'Project Assignment',
  };

  return {
    type,
    thumbnailUrl: media.thumbnailUrl,
    label: typeLabels[type] || 'Lesson Content',
    allowDownload: media.allowDownload,
  };
}
