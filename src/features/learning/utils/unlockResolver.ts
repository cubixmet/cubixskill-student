import type { CourseEntity, CourseLesson } from '../../../stores/course.store';
import { flattenCurriculum } from './flattenCurriculum';

export interface LessonAccessState {
  lessonId: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  canAccess: boolean;
  lockReason?: 'previous_lesson_required' | 'demo_restricted' | 'demo_expired';
}

export interface BackendEnrollmentAccess {
  id?: string;
  access_type?: string;
  accessType?: string;
  status?: string;
  is_valid?: boolean;
}

export interface CalculateLessonAccessMapParams {
  course?: CourseEntity | null;
  enrollment?: BackendEnrollmentAccess | null;
  completedLessonIds?: string[] | null;
  lastAccessedLessonUuid?: string | null;
  lessonLockingEnabled?: boolean;
}

function safeLessonTitle(lesson: any): string {
  return typeof lesson?.title === 'string' ? lesson.title.trim() : '';
}

/**
 * Calculates sequential lesson unlock states and permissions across all curriculum modules.
 */
export function calculateLessonAccessMap(
  params: CalculateLessonAccessMapParams
): Map<string, LessonAccessState> {
  const { course, enrollment, completedLessonIds: rawCompleted, lastAccessedLessonUuid, lessonLockingEnabled } = params;
  const accessMap = new Map<string, LessonAccessState>();

  if (!course) {
    return accessMap;
  }

  const isLockingEnabled = lessonLockingEnabled ?? (course as any)?.lesson_locking_enabled ?? (course as any)?.features?.LESSON_LOCKING ?? (course as any)?.features?.lesson_locking ?? true;

  const completedLessonIds = Array.isArray(rawCompleted) ? rawCompleted : [];
  const accessType = String(enrollment?.access_type || enrollment?.accessType || '').toUpperCase();
  const enrollmentStatus = String(enrollment?.status || '').toUpperCase();
  const isDemoStudent = accessType === 'DEMO';
  const isDemoExpired = isDemoStudent && (enrollmentStatus === 'EXPIRED' || enrollment?.is_valid === false);

  // 1. Flatten all lessons safely in strict module order
  const flattened = flattenCurriculum(course);
  const orderedLessons = flattened.map(({ lesson }) => lesson);

  let previousRequiredCompleted = true; // First lesson is unlocked by default for eligible student

  orderedLessons.forEach((lesson) => {
    const title = safeLessonTitle(lesson);
    const titlePrefix = title ? title.split(/\s+/)[0] : '';
    const legacyTitleId = titlePrefix ? `les-${titlePrefix}` : null;

    const isCompleted =
      completedLessonIds.includes(String(lesson?.id || '')) ||
      (legacyTitleId ? completedLessonIds.includes(legacyTitleId) : false);

    const isDemoAccessible =
      (lesson as any)?.isDemoAccessible === true ||
      (lesson as any)?.is_demo === true ||
      (lesson as any)?.is_preview === true;

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

    if (!isLockingEnabled) {
      accessMap.set(lesson.id, {
        lessonId: lesson.id,
        status: isCompleted ? 'completed' : (lastAccessedLessonUuid === lesson.id ? 'in_progress' : 'unlocked'),
        canAccess: true,
      });
      return;
    }

    // Explicit backend unlock override if present
    const explicitUnlocked = (lesson as any).isUnlocked ?? (lesson as any).unlocked;

    if (explicitUnlocked === false) {
      accessMap.set(lesson.id, {
        lessonId: lesson.id,
        status: 'locked',
        canAccess: false,
        lockReason: (lesson as any).lock_reason || 'previous_lesson_required',
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
  enrollment?: BackendEnrollmentAccess | null;
}): boolean {
  const { lesson, completedLessonIds: rawCompleted, enrollment } = params;
  if (!lesson || !lesson.id) return false;

  const completedLessonIds = Array.isArray(rawCompleted) ? rawCompleted : [];
  const accessType = String(enrollment?.access_type || enrollment?.accessType || '').toUpperCase();
  const enrollmentStatus = String(enrollment?.status || '').toUpperCase();
  if (accessType === 'DEMO' && enrollmentStatus === 'EXPIRED') {
    return false;
  }
  const title = safeLessonTitle(lesson);
  const titlePrefix = title ? title.split(/\s+/)[0] : '';
  const legacyTitleId = titlePrefix ? `les-${titlePrefix}` : null;

  const isCompleted =
    completedLessonIds.includes(String(lesson.id)) ||
    (legacyTitleId ? completedLessonIds.includes(legacyTitleId) : false);
  return !isCompleted;
}
