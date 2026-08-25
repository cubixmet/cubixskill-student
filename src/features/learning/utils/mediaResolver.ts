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
export function resolveLessonType(lesson?: any): LessonType {
  if (!lesson) return 'video';
  const rawType = String(lesson.lesson_type || lesson.type || '').trim().toLowerCase();

  if (rawType === 'video') return 'video';
  if (rawType === 'audio') return 'audio';
  if (rawType === 'image') return 'image';
  if (rawType === 'document' || rawType === 'pdf') return 'document';
  if (rawType === 'rich_text' || rawType === 'text') return 'text';
  if (rawType === 'quiz') return 'test';
  if (rawType === 'assignment' || rawType === 'project') return 'assignment';
  if (rawType === 'test') return 'test';
  if (rawType === 'url' || rawType === 'link') return 'url';

  const titleLower = (lesson.title || '').toLowerCase();
  if (titleLower.includes('video') || titleLower.includes('mp4')) return 'video';
  if (titleLower.includes('pdf') || titleLower.includes('document')) return 'document';
  if (titleLower.includes('image') || titleLower.includes('diagram')) return 'image';
  if (titleLower.includes('stream') || titleLower.includes('hls')) return 'stream';
  if (titleLower.includes('assignment') || titleLower.includes('project')) return 'assignment';
  if (titleLower.includes('quiz') || titleLower.includes('test')) return 'test';
  if (titleLower.includes('url') || titleLower.includes('link')) return 'url';

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
    audio: '',
    stream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    image: '',
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
    thumbnailUrl: lesson?.thumbnailUrl || '',
    mimeType: lesson?.mimeType || (type === 'video' ? 'video/mp4' : undefined),
    allowDownload: lesson?.allowDownload ?? true,
  };
}
