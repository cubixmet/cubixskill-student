export const LAST_ACADEMY_KEY = 'cubixskill:lastAcademy';
export const CHECKOUT_INTENT_KEY = 'cubixskill:checkoutIntent';

export interface CheckoutIntent {
  academyUuid: string;
  courseUuid: string;
  createdAt: number;
}

export function setLastAcademy(academyUuid: string): void {
  if (!academyUuid) return;
  try {
    localStorage.setItem(LAST_ACADEMY_KEY, academyUuid);
  } catch (e) {
    // Ignore storage quota errors
  }
}

export function getLastAcademy(): string | null {
  try {
    return localStorage.getItem(LAST_ACADEMY_KEY);
  } catch (e) {
    return null;
  }
}

export function clearLastAcademy(): void {
  try {
    localStorage.removeItem(LAST_ACADEMY_KEY);
  } catch (e) {
    // Ignore
  }
}

/**
 * Validates that an internal return path is safe:
 * - Must start with a single '/'
 * - Must not start with '//' or contain '://' or 'javascript:'
 * - Must belong to the requested academy context or valid student portal
 */
export function validateInternalReturnPath(
  path: string | null | undefined,
  academyUuid: string
): string | null {
  if (!path || typeof path !== 'string') return null;

  const trimmed = path.trim();

  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  if (trimmed.toLowerCase().includes('javascript:')) return null;

  // Ensure path belongs to current academy context or student routes
  if (academyUuid && (trimmed.startsWith(`/${academyUuid}`) || trimmed.startsWith('/student/academies'))) {
    return trimmed;
  }

  if (trimmed.startsWith('/student/')) {
    return trimmed;
  }

  return null;
}

export function saveCheckoutIntent(data: { academyUuid: string; courseUuid: string }): void {
  if (!data.academyUuid || !data.courseUuid) return;
  try {
    const intent: CheckoutIntent = {
      academyUuid: data.academyUuid,
      courseUuid: data.courseUuid,
      createdAt: Date.now(),
    };
    sessionStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify(intent));
  } catch (e) {
    // Ignore
  }
}

export function getCheckoutIntent(): CheckoutIntent | null {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_INTENT_KEY);
    if (!raw) return null;
    const intent: CheckoutIntent = JSON.parse(raw);
    // Expiry check: 2 hours
    if (Date.now() - intent.createdAt > 2 * 60 * 60 * 1000) {
      clearCheckoutIntent();
      return null;
    }
    return intent;
  } catch (e) {
    return null;
  }
}

export function clearCheckoutIntent(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_INTENT_KEY);
  } catch (e) {
    // Ignore
  }
}

export function buildLoginUrl(academyUuid: string, next?: string): string {
  const base = `/${academyUuid}/login`;
  if (next) {
    const validNext = validateInternalReturnPath(next, academyUuid);
    if (validNext) {
      return `${base}?next=${encodeURIComponent(validNext)}`;
    }
  }
  return base;
}

export function buildRegisterUrl(academyUuid: string, next?: string): string {
  const base = `/${academyUuid}/register`;
  if (next) {
    const validNext = validateInternalReturnPath(next, academyUuid);
    if (validNext) {
      return `${base}?next=${encodeURIComponent(validNext)}`;
    }
  }
  return base;
}
