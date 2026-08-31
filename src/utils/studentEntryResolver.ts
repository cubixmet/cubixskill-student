import { getLastActiveCourse } from './last-active-course.utility';
import { useEnrollmentStore } from '../stores/enrollment.store';
import { useCourseStore } from '../stores/course.store';
import { isValidUuid, buildStudentCourseOverviewPath, buildStudentAcademyCoursesPath } from './routeBuilder';

export interface StudentEntryParams {
  studentUuid: string;
  academyUuid?: string;
  courseUuid?: string;
  returnTo?: string | null;
  intent?: 'demo' | 'full';
}

/**
 * Resolves the protected destination URL for a student upon login/entry.
 * Priority order:
 * 1. Explicit current course intent (courseUuid + academyUuid)
 * 2. Valid internal returnTo parameter
 * 3. Validated Last Active Course (stored in cubixskill:last-active-course)
 * 4. Current academy enrolled-course list
 * 5. Global fallback (/student/academies)
 */
export function resolveStudentEntry(params: StudentEntryParams): string {
  const { studentUuid, academyUuid, courseUuid, returnTo } = params;
  const getEnrollment = useEnrollmentStore.getState().getEnrollment;
  const getStudentCoursesByAcademy = useCourseStore.getState().getStudentCoursesByAcademy;

  // 1. Explicit current course intent
  if (isValidUuid(academyUuid) && isValidUuid(courseUuid)) {
    const enrollment = getEnrollment(studentUuid, courseUuid!);
    if (!enrollment || enrollment.status !== 'expired') {
      return buildStudentCourseOverviewPath(academyUuid!, courseUuid!);
    }
  }

  // 2. Safe Internal returnTo URL check
  if (
    returnTo &&
    typeof returnTo === 'string' &&
    returnTo.startsWith('/') &&
    !returnTo.startsWith('//') &&
    !returnTo.includes('javascript:') &&
    !returnTo.includes('/undefined') &&
    !returnTo.includes('/null')
  ) {
    return returnTo;
  }

  // 3. Validated Last Active Course
  const lastActive = getLastActiveCourse();
  if (lastActive && isValidUuid(lastActive.academyUuid) && isValidUuid(lastActive.courseUuid)) {
    const activeEnrollment = getEnrollment(studentUuid, lastActive.courseUuid);
    if (activeEnrollment) {
      return buildStudentCourseOverviewPath(lastActive.academyUuid, lastActive.courseUuid);
    }
  }

  // 4. Current academy enrolled-course list
  if (isValidUuid(academyUuid)) {
    return `/student/academies/${academyUuid}`;
  }

  // 5. Global fallback
  return '/student/academies';
}
