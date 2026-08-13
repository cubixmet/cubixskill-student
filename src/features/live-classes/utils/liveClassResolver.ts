import type { LiveClass } from '../../../stores/live-class.store';
import type { CourseEnrollment } from '../../../stores/enrollment.store';

export interface LiveClassAccessResult {
  canAccess: boolean;
  reason?: 'enrollment_required' | 'demo_restricted' | 'demo_expired' | 'join_early_restricted';
}

/**
 * Resolves the display status for a LiveClass item.
 */
export function resolveLiveClassStatus(liveClass: LiveClass): 'LIVE_NOW' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED' {
  if (liveClass.status === 'cancelled') return 'CANCELLED';
  if (liveClass.status === 'completed') return 'COMPLETED';

  const now = new Date().getTime();
  const start = new Date(liveClass.scheduledStartAt).getTime();
  const end = liveClass.scheduledEndAt ? new Date(liveClass.scheduledEndAt).getTime() : start + 1000 * 60 * 60;

  if (liveClass.status === 'live' || (now >= start && now <= end)) {
    return 'LIVE_NOW';
  }

  if (now < start) {
    return 'UPCOMING';
  }

  return 'COMPLETED';
}

/**
 * Resolves student viewing/joining permissions for a LiveClass.
 */
export function canAccessLiveClass(params: {
  liveClass: LiveClass;
  enrollment?: CourseEnrollment;
}): LiveClassAccessResult {
  const { liveClass, enrollment } = params;

  if (!enrollment) {
    return { canAccess: false, reason: 'enrollment_required' };
  }

  const isDemoStudent = enrollment.accessType === 'demo';
  const isDemoExpired = isDemoStudent && enrollment.status === 'expired';

  if (isDemoExpired) {
    return { canAccess: false, reason: 'demo_expired' };
  }

  if (isDemoStudent && liveClass.isDemoAccessible === false) {
    return { canAccess: false, reason: 'demo_restricted' };
  }

  return { canAccess: true };
}

/**
 * Formats ISO date string into readable student date (e.g. Thursday, Aug 14).
 */
export function formatLiveClassDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

/**
 * Formats ISO date string into readable start & end time (e.g. 7:00 PM - 8:30 PM).
 */
export function formatLiveClassTime(startIso: string, endIso?: string): string {
  try {
    const s = new Date(startIso);
    const startTimeStr = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (!endIso) return startTimeStr;

    const e = new Date(endIso);
    const endTimeStr = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${startTimeStr} – ${endTimeStr}`;
  } catch {
    return startIso;
  }
}

/**
 * Formats duration between start and end timestamps.
 */
export function formatLiveClassDuration(startIso: string, endIso?: string): string {
  if (!endIso) return '60 Mins';
  try {
    const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} Mins`;
  } catch {
    return '60 Mins';
  }
}
