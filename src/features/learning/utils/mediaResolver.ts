import type { CourseLesson, LessonType } from '../../../stores/course.store';

/**
 * Validates if a given URL is a safe http or https URL.
 * Rejects unsafe schemes like javascript:, data:, file:, etc.
 */
export function isSafeHttpUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('file:')) {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Checks whether an external URL is likely embeddable inside an iframe.
 */
export function isEmbeddableUrl(url?: string): boolean {
  if (!isSafeHttpUrl(url)) return false;
  const lower = (url || '').toLowerCase();
  // Sites known to send X-Frame-Options: DENY or SAMEORIGIN
  if (lower.includes('google.com') || lower.includes('github.com') || lower.includes('twitter.com') || lower.includes('x.com')) {
    return false;
  }
  return true;
}

/**
 * Determines the normalized LessonType for a given lesson entity.
 */
export function resolveLessonType(lesson?: CourseLesson): LessonType {
  if (!lesson) return 'video';
  if (lesson.type) return lesson.type;

  const titleLower = lesson.title.toLowerCase();
  if (titleLower.includes('video') || titleLower.includes('mp4') || titleLower.includes('compiler') || titleLower.includes('boundaries')) {
    return 'video';
  }
  if (titleLower.includes('pdf') || titleLower.includes('document') || titleLower.includes('guide') || titleLower.includes('useactionstate')) {
    return 'document';
  }
  if (titleLower.includes('image') || titleLower.includes('diagram') || titleLower.includes('architecture')) {
    return 'image';
  }
  if (titleLower.includes('stream') || titleLower.includes('hls') || titleLower.includes('live')) {
    return 'stream';
  }
  if (titleLower.includes('assignment') || titleLower.includes('project') || titleLower.includes('injection')) {
    return 'assignment';
  }
  if (titleLower.includes('quiz') || titleLower.includes('test') || titleLower.includes('check') || titleLower.includes('assessment')) {
    return 'test';
  }
  if (titleLower.includes('url') || titleLower.includes('link') || titleLower.includes('preventing')) {
    return 'url';
  }
  return 'video';
}

/**
 * Resolves normalized media parameters for a lesson.
 */
export function resolveLessonMedia(lesson?: CourseLesson) {
  const type = resolveLessonType(lesson);
  const rawMediaUrl = lesson?.mediaUrl;
  const isSafe = isSafeHttpUrl(rawMediaUrl);

  const defaultMediaUrls: Record<LessonType, string> = {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    stream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    document: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    url: 'https://react.dev',
    text: '',
    test: '',
    assignment: '',
  };

  const mediaUrl = isSafe ? rawMediaUrl! : defaultMediaUrls[type] || '';

  return {
    type,
    mediaUrl,
    isSafe,
    thumbnailUrl: lesson?.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    mimeType: lesson?.mimeType || (type === 'video' ? 'video/mp4' : undefined),
    allowDownload: lesson?.allowDownload ?? true,
  };
}
