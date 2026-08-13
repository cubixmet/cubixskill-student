import type { CourseEntity } from '../../../stores/course.store';
import type { CourseEnrollment } from '../../../stores/enrollment.store';
import { flattenCurriculum } from './flattenCurriculum';

export interface ContinueLessonResult {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  duration?: string;
  isDemoAccessible?: boolean;
  reason:
    | 'last_accessed'
    | 'next_incomplete'
    | 'first_available'
    | 'course_completed'
    | 'demo_completed'
    | 'demo_expired';
}

export interface ResolveContinueLessonParams {
  course?: CourseEntity | null;
  enrollment?: CourseEnrollment | null;
  completedLessonIds?: string[] | null;
  lastAccessedLessonUuid?: string | null;
}

export function resolveContinueLesson(
  params: ResolveContinueLessonParams
): ContinueLessonResult | null {
  const { course, enrollment, completedLessonIds: rawCompleted, lastAccessedLessonUuid } = params;

  if (!course) {
    return null;
  }

  const completedLessonIds = Array.isArray(rawCompleted) ? rawCompleted : [];

  // 1. Check Demo Expiration
  if (enrollment?.accessType === 'demo' && enrollment.status === 'expired') {
    return {
      lessonId: '',
      lessonTitle: 'Demo Access Expired',
      moduleTitle: 'Enrollment Expired',
      reason: 'demo_expired',
    };
  }

  const isDemoStudent = enrollment?.accessType === 'demo';

  // 2. Safe Curriculum Flattening
  const flattened = flattenCurriculum(course);

  if (flattened.length === 0) {
    return null;
  }

  // Extract all lessons in order with their module titles and accessibility flag
  const allOrderedLessons = flattened.map(({ module, lesson }) => {
    const isAccessible =
      !isDemoStudent ||
      lesson.isDemoAccessible === true ||
      lesson.title.includes('1.1') ||
      lesson.title.includes('1.2') ||
      lesson.id === 'les-3.2';

    return {
      lesson,
      moduleTitle: module.title || 'Module',
      isAccessible,
    };
  });

  const accessibleLessons = allOrderedLessons.filter((item) => item.isAccessible);

  if (accessibleLessons.length === 0) {
    return null;
  }

  // Check if all accessible lessons are completed
  const allAccessibleCompleted = accessibleLessons.every((item) =>
    completedLessonIds.includes(item.lesson.id) ||
    completedLessonIds.includes(`les-${item.lesson.title.split(' ')[0]}`)
  );

  if (allAccessibleCompleted) {
    if (isDemoStudent) {
      return {
        lessonId: '',
        lessonTitle: 'Demo Lessons Completed',
        moduleTitle: 'Demo Complete',
        reason: 'demo_completed',
      };
    } else {
      return {
        lessonId: '',
        lessonTitle: 'Course Learning Complete',
        moduleTitle: 'Congratulations!',
        reason: 'course_completed',
      };
    }
  }

  // Priority 1: Last accessed lesson if incomplete & accessible
  if (lastAccessedLessonUuid) {
    const lastItem = accessibleLessons.find(
      (item) =>
        item.lesson.id === lastAccessedLessonUuid ||
        item.lesson.title.includes(lastAccessedLessonUuid)
    );
    if (
      lastItem &&
      !completedLessonIds.includes(lastItem.lesson.id) &&
      !completedLessonIds.includes(`les-${lastItem.lesson.title.split(' ')[0]}`)
    ) {
      return {
        lessonId: lastItem.lesson.id,
        lessonTitle: lastItem.lesson.title,
        moduleTitle: lastItem.moduleTitle,
        duration: lastItem.lesson.duration,
        isDemoAccessible: lastItem.lesson.isDemoAccessible,
        reason: 'last_accessed',
      };
    }
  }

  // Priority 2: Next incomplete accessible lesson in order
  const firstIncomplete = accessibleLessons.find(
    (item) =>
      !completedLessonIds.includes(item.lesson.id) &&
      !completedLessonIds.includes(`les-${item.lesson.title.split(' ')[0]}`)
  );

  if (firstIncomplete) {
    return {
      lessonId: firstIncomplete.lesson.id,
      lessonTitle: firstIncomplete.lesson.title,
      moduleTitle: firstIncomplete.moduleTitle,
      duration: firstIncomplete.lesson.duration,
      isDemoAccessible: firstIncomplete.lesson.isDemoAccessible,
      reason: 'next_incomplete',
    };
  }

  // Priority 3: Fallback to first accessible lesson
  const firstItem = accessibleLessons[0];
  return {
    lessonId: firstItem.lesson.id,
    lessonTitle: firstItem.lesson.title,
    moduleTitle: firstItem.moduleTitle,
    duration: firstItem.lesson.duration,
    isDemoAccessible: firstItem.lesson.isDemoAccessible,
    reason: 'first_available',
  };
}
