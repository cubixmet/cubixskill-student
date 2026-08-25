const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a non-null, non-empty, non-literal "undefined"/"null" string identifier.
 */
export function isValidUuid(value?: string | null): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null' || trimmed === '[object Object]') {
    return false;
  }
  // Standard UUID check or valid backend ID string check
  return UUID_REGEX.test(trimmed) || (trimmed.length >= 8 && !trimmed.includes('/'));
}

export function buildStudentCourseOverviewPath(academyUuid?: string | null, courseUuid?: string | null): string {
  if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
    return '/student/academies';
  }
  return `/student/academies/${academyUuid}/courses/${courseUuid}/overview`;
}

export function buildStudentCourseLearnPath(academyUuid?: string | null, courseUuid?: string | null, lessonUuid?: string | null): string {
  if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
    return '/student/academies';
  }
  if (isValidUuid(lessonUuid)) {
    return `/student/academies/${academyUuid}/courses/${courseUuid}/learn/${lessonUuid}`;
  }
  return `/student/academies/${academyUuid}/courses/${courseUuid}/learn`;
}

export function buildStudentCourseCurriculumPath(academyUuid?: string | null, courseUuid?: string | null): string {
  if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
    return '/student/academies';
  }
  return `/student/academies/${academyUuid}/courses/${courseUuid}/curriculum`;
}

export function buildStudentAcademyCoursesPath(academyUuid?: string | null): string {
  if (!isValidUuid(academyUuid)) {
    return '/student/academies';
  }
  return `/student/academies/${academyUuid}`;
}

export const studentCourseRoutes = {
  overview: buildStudentCourseOverviewPath,
  learn: buildStudentCourseLearnPath,
  curriculum: buildStudentCourseCurriculumPath,
  academyCourses: buildStudentAcademyCoursesPath,
};
