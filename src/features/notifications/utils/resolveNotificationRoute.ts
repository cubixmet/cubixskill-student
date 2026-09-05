import type { StudentNotification } from '../../../stores/notification.store';

/**
 * Resolves the contextual destination route for a student notification.
 */
export function resolveNotificationRoute(
  notification: StudentNotification,
  academyUuid: string,
  courseUuid: string
): string {
  const baseUrl = `/student/academies/${academyUuid}/courses/${courseUuid}`;

  if (notification.action?.route) {
    return notification.action.route;
  }

  switch (notification.type) {
    case 'live_class':
      return `${baseUrl}/live-classes`;

    case 'assignment':
    case 'assessment':
    case 'course_update':
      if (notification.context?.lessonUuid) {
        return `${baseUrl}/learn?lesson=${encodeURIComponent(notification.context.lessonUuid)}`;
      }
      return `${baseUrl}/curriculum`;

    case 'discussion':
      return `${baseUrl}/discussions`;

    case 'personal_chat':
      return `${baseUrl}/personal-chat`;

    case 'certificate':
      return `${baseUrl}/certificates`;

    case 'demo':
    case 'announcement':
    case 'system':
    default:
      return `${baseUrl}/overview`;
  }
}

/**
 * Formats a notification ISO timestamp into human-friendly relative time (e.g. 5 min ago, Today 7:00 PM).
 */
export function formatNotificationTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}
