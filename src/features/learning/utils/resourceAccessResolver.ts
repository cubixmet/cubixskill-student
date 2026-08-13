import type { CourseResource } from '../../../stores/resource.store';
import type { CourseEnrollment } from '../../../stores/enrollment.store';

export interface ResourceAccessResult {
  canView: boolean;
  canDownload: boolean;
  reason?: 'enrollment_required' | 'demo_restricted' | 'demo_expired' | 'view_only';
}

/**
 * Resolves student viewing and downloading permissions for a learning resource.
 */
export function resolveResourceAccess(params: {
  resource: CourseResource;
  enrollment?: CourseEnrollment;
}): ResourceAccessResult {
  const { resource, enrollment } = params;

  if (!enrollment) {
    return {
      canView: false,
      canDownload: false,
      reason: 'enrollment_required',
    };
  }

  const isDemoStudent = enrollment.accessType === 'demo';
  const isDemoExpired = isDemoStudent && enrollment.status === 'expired';

  if (isDemoExpired) {
    return {
      canView: false,
      canDownload: false,
      reason: 'demo_expired',
    };
  }

  if (isDemoStudent && resource.isDemoAccessible === false) {
    return {
      canView: false,
      canDownload: false,
      reason: 'demo_restricted',
    };
  }

  const canView = resource.allowView;
  const canDownload = resource.allowView && resource.allowDownload;

  return {
    canView,
    canDownload,
    reason: !canDownload && canView ? 'view_only' : undefined,
  };
}

/**
 * Formats raw byte counts into human-readable strings (e.g. 540 KB, 2.4 MB).
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}
