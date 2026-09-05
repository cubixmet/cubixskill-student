import { useCourseStore } from '../stores/course.store';
import { isValidUuid, buildStudentCourseOverviewPath } from './routeBuilder';
import { getStudentResumePath, getCanonicalResumePath } from './studentResume';
import { studentPortalService } from '../services/studentPortal.service';

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
 * 3. User-scoped Last Visited Location Resume (student:last-resume-path:${userId})
 * 4. Current academy enrolled-course list
 * 5. Global fallback (/student/academies)
 */
export async function resolveStudentEntryAsync(params: StudentEntryParams): Promise<string> {
  const { studentUuid, academyUuid, courseUuid, returnTo } = params;

  // 1. Explicit current course intent
  if (isValidUuid(academyUuid) && isValidUuid(courseUuid)) {
    return buildStudentCourseOverviewPath(academyUuid!, courseUuid!);
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
    const canonical = getCanonicalResumePath(returnTo);
    return canonical || returnTo;
  }

  // 3. User-scoped Last Visited Location Resume (student:last-resume-path:${userId})
  const userResumePath = getStudentResumePath(studentUuid);
  if (userResumePath && (!academyUuid || userResumePath.includes(academyUuid))) {
    return userResumePath;
  }

  // 4. Check backend enrollment count for current academy
  if (isValidUuid(academyUuid)) {
    const enrollments = await studentPortalService.getStudentEnrollments();
    const activeAcademyEnrollments = (enrollments || []).filter((e: any) => {
      if (e.status !== 'ACTIVE' && e.status !== 'COMPLETED' && e.status !== 'active') return false;
      const eAcadId = e.course?.academy?.id || e.course?.academy?.uuid || e.academy_id || e.academy_uuid;
      return String(eAcadId) === String(academyUuid);
    });

    if (activeAcademyEnrollments.length >= 1) {
      return `/student/academies/${academyUuid}`;
    } else {
      // ZERO active enrollments in this academy -> redirect to public academy home
      return `/${academyUuid}`;
    }
  }

  // 5. Global fallback
  return '/student/academies';
}

export function resolveStudentEntry(params: StudentEntryParams): string {
  const { studentUuid, academyUuid, courseUuid, returnTo } = params;

  if (isValidUuid(academyUuid) && isValidUuid(courseUuid)) {
    return buildStudentCourseOverviewPath(academyUuid!, courseUuid!);
  }

  if (
    returnTo &&
    typeof returnTo === 'string' &&
    returnTo.startsWith('/') &&
    !returnTo.startsWith('//') &&
    !returnTo.includes('javascript:') &&
    !returnTo.includes('/undefined') &&
    !returnTo.includes('/null')
  ) {
    const canonical = getCanonicalResumePath(returnTo);
    return canonical || returnTo;
  }

  const userResumePath = getStudentResumePath(studentUuid);
  if (userResumePath && (!academyUuid || userResumePath.includes(academyUuid))) {
    return userResumePath;
  }

  if (isValidUuid(academyUuid)) {
    return `/student/academies/${academyUuid}`;
  }

  return '/student/academies';
}
