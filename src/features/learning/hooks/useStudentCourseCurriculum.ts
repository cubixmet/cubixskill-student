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
    return learnData?.modules || [];
  }, [learnData]);

  const allLessons: CurriculumLessonSummary[] = useMemo(() => {
    const list: CurriculumLessonSummary[] = [];
    modules.forEach((mod) => {
      if (Array.isArray(mod.lessons)) {
        mod.lessons.forEach((les) => {
          list.push({
            ...les,
            id: String(les.id || les.uuid),
            uuid: String(les.uuid || les.id),
            moduleTitle: mod.title,
            moduleId: String(mod.id),
            moduleUuid: String(mod.uuid || mod.id),
          });
        });
      }
    });
    return list;
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
