import type { CourseLesson, LessonType } from '../../../stores/course.store';
import { resolveMediaUrl } from '../../../services/apiClient';

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
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
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
export function resolveLessonMedia(lesson?: any) {
  const type = resolveLessonType(lesson);
  const content = lesson?.content || {};
  const primaryMedia = lesson?.primary_media || lesson?.primaryMedia || {};
  const firstMediaFile = (lesson?.media_files || lesson?.mediaFiles || [])[0]?.media_file || {};

  const rawUrl = (
    lesson?.document_url ||
    lesson?.documentUrl ||
    lesson?.video_url ||
    lesson?.videoUrl ||
    lesson?.audio_url ||
    lesson?.audioUrl ||
    lesson?.stream_url ||
    lesson?.mediaUrl ||
    lesson?.media_url ||
    lesson?.external_url ||
    lesson?.externalUrl ||
    primaryMedia?.url ||
    primaryMedia?.file ||
    firstMediaFile?.url ||
    firstMediaFile?.file ||
    content?.documentUrl ||
    content?.externalUrl ||
    content?.mediaUrl ||
    content?.fileUrl ||
    ''
  ).trim();

  const resolvedUrl = resolveMediaUrl(rawUrl);
  const isSafe = isSafeHttpUrl(resolvedUrl);

  return {
    type,
    mediaUrl: isSafe ? resolvedUrl : '',
    rawUrl,
    isSafe,
    thumbnailUrl: lesson?.thumbnailUrl || lesson?.thumbnail_url || '',
    mimeType: lesson?.mimeType || lesson?.mime_type || primaryMedia?.mime_type || firstMediaFile?.mime_type || (type === 'video' ? 'video/mp4' : undefined),
    allowDownload: lesson?.allowDownload ?? lesson?.allow_download ?? true,
  };
}

export type DocumentKind = 'pdf' | 'image' | 'text' | 'download';

export interface DocumentSource {
  url: string;
  kind: DocumentKind;
  mimeType?: string;
  filename?: string;
  allowDownload: boolean;
}

export function resolveLessonDocumentSource(lesson?: any): DocumentSource | null {
  if (!lesson) return null;
  const media = resolveLessonMedia(lesson);
  if (!media.mediaUrl) return null;

  const url = media.mediaUrl;
  const mimeType = (media.mimeType || '').toLowerCase();
  const urlLower = url.toLowerCase();

  let kind: DocumentKind = 'download';

  if (mimeType === 'application/pdf' || urlLower.includes('.pdf')) {
    kind = 'pdf';
  } else if (
    mimeType.startsWith('image/') ||
    urlLower.endsWith('.png') ||
    urlLower.endsWith('.jpg') ||
    urlLower.endsWith('.jpeg') ||
    urlLower.endsWith('.svg') ||
    urlLower.endsWith('.webp')
  ) {
    kind = 'image';
  } else if (
    mimeType.startsWith('text/') ||
    urlLower.endsWith('.txt')
  ) {
    kind = 'text';
  } else {
    kind = 'download';
  }

  const primaryMedia = lesson?.primary_media || lesson?.primaryMedia || {};
  const firstMediaFile = (lesson?.media_files || lesson?.mediaFiles || [])[0]?.media_file || {};
  const filename =
    primaryMedia?.original_filename ||
    primaryMedia?.display_name ||
    firstMediaFile?.original_filename ||
    firstMediaFile?.display_name ||
    lesson?.title ||
    'Document File';

  return {
    url,
    kind,
    mimeType: media.mimeType,
    filename,
    allowDownload: media.allowDownload,
  };
}
