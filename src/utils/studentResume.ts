import { isValidUuid } from './routeBuilder';

/**
 * User-scoped localStorage key generator.
 * Format: student:last-resume-path:${userId}
 */
export function getStudentResumeStorageKey(userId?: string | null): string | null {
  if (!userId || typeof userId !== 'string' || !userId.trim()) return null;
  const cleanId = userId.trim();
  if (cleanId.toLowerCase() === 'undefined' || cleanId.toLowerCase() === 'null') return null;
  return `student:last-resume-path:${cleanId}`;
}

/**
 * Resolves a raw pathname into a safe canonical resume destination based on product rules.
 * Returns null if the pathname is forbidden, unauthenticated, invalid, or non-resumeable.
 */
export function getCanonicalResumePath(pathname: string): string | null {
  if (!pathname || typeof pathname !== 'string') return null;

  // Remove query params, hashes, and trailing slashes
  const cleanPath = pathname.split('?')[0].split('#')[0].trim().replace(/\/+$/, '');

  // Forbidden routes that must NEVER be saved as resume targets
  const forbiddenKeywords = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-email',
    '/setup-password',
    '/reset-password',
    '/404',
    '/403',
    '/401',
    '/500',
    '/network-error',
    'undefined',
    'null',
    '[object Object]',
  ];

  for (const kw of forbiddenKeywords) {
    if (cleanPath.toLowerCase().includes(kw)) {
      return null;
    }
  }

  // Parse path segments
  const parts = cleanPath.split('/').filter(Boolean);

  // Pattern 1: Standard Student Portal (/student/academies/:academyId...)
  if (parts.length >= 3 && parts[0] === 'student' && parts[1] === 'academies') {
    const academyId = parts[2];
    if (!isValidUuid(academyId)) return null;

    // Rule 1: Inside a course (/student/academies/:academyId/courses/:courseId/...)
    if (parts.length >= 5 && parts[3] === 'courses') {
      const courseId = parts[4];
      if (!isValidUuid(courseId)) return null;
      return `/student/academies/${academyId}/courses/${courseId}/overview`;
    }

    // Rule 3: Course list (/student/academies/:academyId/courses)
    if (parts.length === 4 && parts[3] === 'courses') {
      return `/student/academies/${academyId}/courses`;
    }

    // Rule 2: Academy Landing (/student/academies/:academyId or /student/academies/:academyId/dashboard)
    if (parts.length === 3 || (parts.length === 4 && parts[3] === 'dashboard')) {
      return `/student/academies/${academyId}`;
    }
  }

  // Pattern 2: Direct public academy route format: /:academyId...
  if (parts.length >= 1 && isValidUuid(parts[0])) {
    const academyId = parts[0];

    // Rule 1: Inside a course (/:academyId/courses/:courseId/...)
    if (parts.length >= 3 && parts[1] === 'courses' && isValidUuid(parts[2])) {
      const courseId = parts[2];
      return `/student/academies/${academyId}/courses/${courseId}/overview`;
    }

    // Rule 3: Course list (/:academyId/courses)
    if (parts.length === 2 && parts[1] === 'courses') {
      return `/student/academies/${academyId}/courses`;
    }

    // Rule 2: Academy Landing (/:academyId or /:academyId/dashboard)
    if (parts.length === 1 || (parts.length === 2 && parts[1] === 'dashboard')) {
      return `/student/academies/${academyId}`;
    }
  }

  return null;
}

/**
 * Saves the canonical resume location to user-scoped localStorage.
 */
export function saveStudentResumePath(userId: string | null | undefined, pathname: string): void {
  const key = getStudentResumeStorageKey(userId);
  if (!key) return;

  const canonicalPath = getCanonicalResumePath(pathname);
  if (!canonicalPath) return;

  try {
    localStorage.setItem(key, canonicalPath);
  } catch (e) {
    // Ignore storage quota errors
  }
}

/**
 * Reads the stored canonical resume location for a given user.
 */
export function getStudentResumePath(userId: string | null | undefined): string | null {
  const key = getStudentResumeStorageKey(userId);
  if (!key) return null;

  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const canonical = getCanonicalResumePath(saved);
    return canonical;
  } catch (e) {
    return null;
  }
}

/**
 * Clears the stored resume location for a given user.
 */
export function clearStudentResumePath(userId: string | null | undefined): void {
  const key = getStudentResumeStorageKey(userId);
  if (!key) return;

  try {
    localStorage.removeItem(key);
  } catch (e) {
    // Ignore
  }
}
