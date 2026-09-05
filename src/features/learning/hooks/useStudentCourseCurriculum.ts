import { useState, useEffect, useCallback, useMemo } from 'react';
import { studentPortalService } from '../../../services/studentPortal.service';
import { isValidUuid } from '../../../utils/routeBuilder';

export interface CurriculumLessonSummary {
  id: string;
  uuid: string;
  title: string;
  description?: string;
  content?: string;
  lesson_type: string;
  duration_minutes?: number;
  duration?: string;
  completed?: boolean;
  is_completed?: boolean;
  unlocked?: boolean;
  lock_reason?: string | null;
  required_lesson?: { id: string; title: string } | null;
  is_demo?: boolean;
  allow_download?: boolean;
  moduleTitle?: string;
  moduleId?: string;
  moduleUuid?: string;
}

export interface CurriculumModuleItem {
  id: string;
  uuid: string;
  title: string;
  description?: string;
  order?: number;
  lessons: CurriculumLessonSummary[];
}

export interface CourseProgressInfo {
  percentage: number;
  completed_lessons: number;
  total_lessons: number;
}

export function useStudentCourseCurriculum(academyUuid?: string, courseUuid?: string) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [learnData, setLearnData] = useState<any>(null);

  const fetchBootstrap = useCallback(async () => {
    if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
      setError('Invalid academy or course parameters.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await studentPortalService.getCourseLearnBootstrap(academyUuid!, courseUuid!);
      setLearnData(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to load course curriculum.');
    } finally {
      setIsLoading(false);
    }
  }, [academyUuid, courseUuid]);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  const modules: CurriculumModuleItem[] = useMemo(() => {
    const rawModules = Array.isArray(learnData?.modules) ? learnData.modules : [];
    return rawModules
      .filter(Boolean)
      .map((mod: any, moduleIndex: number) => {
        const moduleId = mod?.id || mod?.uuid || `module-${moduleIndex}`;
        const rawLessons = Array.isArray(mod?.lessons) ? mod.lessons : [];
        return {
          ...mod,
          id: String(moduleId),
          uuid: String(mod?.uuid || moduleId),
          title: typeof mod?.title === 'string' && mod.title.trim() ? mod.title : `Module ${moduleIndex + 1}`,
          description: typeof mod?.description === 'string' ? mod.description : '',
          lessons: rawLessons
            .filter(Boolean)
            .map((lesson: any, lessonIndex: number) => {
              const lessonId = lesson?.id || lesson?.uuid || `lesson-${moduleIndex}-${lessonIndex}`;
              return {
                ...lesson,
                id: String(lessonId),
                uuid: String(lesson?.uuid || lessonId),
                title: typeof lesson?.title === 'string' && lesson.title.trim() ? lesson.title : `Lesson ${lessonIndex + 1}`,
                description: typeof lesson?.description === 'string' ? lesson.description : '',
                content: typeof lesson?.content === 'string' ? lesson.content : '',
                lesson_type: lesson?.lesson_type || lesson?.type || 'TEXT',
                completed: Boolean(lesson?.completed || lesson?.is_completed),
                is_completed: Boolean(lesson?.is_completed || lesson?.completed),
                unlocked: lesson?.unlocked !== false,
                stream_url: lesson?.stream_url || lesson?.primary_media?.stream_url || null,
                video_url: lesson?.video_url || null,
                media_url: lesson?.media_url || null,
                original_url: lesson?.original_url || lesson?.primary_media?.original_url || null,
                external_url: lesson?.external_url || null,
                processing_mode: lesson?.processing_mode || lesson?.primary_media?.processing_mode || null,
                processing_status: lesson?.processing_status || lesson?.primary_media?.processing_status || null,
                primary_media: lesson?.primary_media || null,
                media_files: Array.isArray(lesson?.media_files) ? lesson.media_files : [],
                mime_type: lesson?.mime_type || null,
                moduleTitle: typeof mod?.title === 'string' && mod.title.trim() ? mod.title : `Module ${moduleIndex + 1}`,
                moduleId: String(moduleId),
                moduleUuid: String(mod?.uuid || moduleId),
              };
            }),
        };
      });
  }, [learnData]);

  const allLessons: CurriculumLessonSummary[] = useMemo(() => {
    return modules.flatMap((mod) =>
      (Array.isArray(mod.lessons) ? mod.lessons : []).map((lesson) => ({
        ...lesson,
        moduleTitle: mod.title,
        moduleId: mod.id,
        moduleUuid: mod.uuid,
      }))
    );
  }, [modules]);

  const courseTitle: string = learnData?.course?.title || 'Course Content';
  const enrollment = learnData?.enrollment;
  const progress: CourseProgressInfo = learnData?.progress || { percentage: 0, completed_lessons: 0, total_lessons: 0 };

  return {
    isLoading,
    error,
    learnData,
    courseTitle,
    modules,
    allLessons,
    enrollment,
    progress,
    refetch: fetchBootstrap,
    setLearnData,
  };
}
