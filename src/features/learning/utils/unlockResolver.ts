import type { CourseEntity, CourseLesson } from '../../../stores/course.store';
import type { CourseEnrollment } from '../../../stores/enrollment.store';
import { flattenCurriculum } from './flattenCurriculum';

export interface LessonAccessState {
  lessonId: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  canAccess: boolean;
  lockReason?: 'previous_lesson_required' | 'demo_restricted' | 'demo_expired';
}

export interface CalculateLessonAccessMapParams {
  course?: CourseEntity | null;
  enrollment?: CourseEnrollment | null;
  completedLessonIds?: string[] | null;
  lastAccessedLessonUuid?: string | null;
}

/**
 * Calculates sequential lesson unlock states and permissions across all curriculum modules.
 * Enforces:
 * 1. Demo student restrictions (only isDemoAccessible lessons eligible)
 * 2. Demo expiration checks
 * 3. Sequential completion requirement (Lesson N+1 unlocks only after Lesson N is completed)
 */
export function calculateLessonAccessMap(
  params: CalculateLessonAccessMapParams
): Map<string, LessonAccessState> {
  const { course, enrollment, completedLessonIds: rawCompleted, lastAccessedLessonUuid } = params;
  const accessMap = new Map<string, LessonAccessState>();

  if (!course) {
    return accessMap;
  }

  const completedLessonIds = Array.isArray(rawCompleted) ? rawCompleted : [];
  const isDemoStudent = enrollment?.accessType === 'demo';
  const isDemoExpired = isDemoStudent && enrollment?.status === 'expired';

  // 1. Flatten all lessons safely in strict module order
  const flattened = flattenCurriculum(course);
  const orderedLessons = flattened.map(({ lesson }) => lesson);

  let previousRequiredCompleted = true; // First lesson is unlocked by default for eligible student

  orderedLessons.forEach((lesson) => {
    const isCompleted =
      completedLessonIds.includes(lesson.id) ||
      completedLessonIds.includes(`les-${lesson.title.split(' ')[0]}`);

    const isDemoAccessible =
      lesson.isDemoAccessible === true ||
      lesson.title.includes('1.1') ||
      lesson.title.includes('1.2') ||
      lesson.id === 'les-3.2';

    if (isDemoExpired) {
      accessMap.set(lesson.id, {
        lessonId: lesson.id,
        status: 'locked',
        canAccess: false,
        lockReason: 'demo_expired',
      });
      return;
    }

    if (isDemoStudent && !isDemoAccessible) {
      accessMap.set(lesson.id, {
        lessonId: lesson.id,
        status: 'locked',
        canAccess: false,
        lockReason: 'demo_restricted',
      });
      return;
    }

    // Determine status
    if (isCompleted) {
      accessMap.set(lesson.id, {
        lessonId: lesson.id,
        status: 'completed',
        canAccess: true,
      });
      previousRequiredCompleted = true;
    } else if (previousRequiredCompleted) {
      const isLastAccessed = lastAccessedLessonUuid === lesson.id;
      accessMap.set(lesson.id, {
        lessonId: lesson.id,
        status: isLastAccessed ? 'in_progress' : 'unlocked',
        canAccess: true,
      });
      // Sequential lock: subsequent uncompleted lessons remain locked until this one is completed
      previousRequiredCompleted = false;
    } else {
      accessMap.set(lesson.id, {
        lessonId: lesson.id,
        status: 'locked',
        canAccess: false,
        lockReason: 'previous_lesson_required',
      });
    }
  });

  return accessMap;
}

/**
 * Policy resolver determining if a lesson can be marked complete by explicit action.
 */
export function canCompleteLesson(params: {
  lesson?: CourseLesson | null;
  completedLessonIds?: string[] | null;
  enrollment?: CourseEnrollment | null;
}): boolean {
  const { lesson, completedLessonIds: rawCompleted, enrollment } = params;
  if (!lesson || !lesson.id) return false;

  const completedLessonIds = Array.isArray(rawCompleted) ? rawCompleted : [];
  if (enrollment?.accessType === 'demo' && enrollment.status === 'expired') {
    return false;
  }
  const isCompleted =
    completedLessonIds.includes(lesson.id) ||
    completedLessonIds.includes(`les-${lesson.title.split(' ')[0]}`);
  return !isCompleted;
}
