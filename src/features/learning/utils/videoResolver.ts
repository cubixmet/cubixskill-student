import { resolveMediaUrl } from '../../../services/apiClient';

export type VideoSourceKind = 'direct' | 'hls' | 'youtube' | 'vimeo' | 'wistia' | 'embed';

export interface ResolvedVideoSource {
  rawUrl: string;
  url: string;
  embedUrl?: string;
  kind: VideoSourceKind;
  mimeType?: string;
  providerLabel?: string;
}

export function resolveVideoSource(lesson?: any): ResolvedVideoSource | null {
  if (!lesson) return null;

  const processingMode = String(lesson.processing_mode || lesson.primary_media?.processing_mode || '').toLowerCase();

  let rawUrl = '';
  if (processingMode === 'direct') {
    rawUrl = (
      lesson.original_url ||
      lesson.video_url ||
      lesson.videoUrl ||
      lesson.media_url ||
      lesson.mediaUrl ||
      lesson.external_url ||
      lesson.externalUrl ||
      ''
    ).trim();
  } else {
    rawUrl = (
      lesson.stream_url ||
      lesson.streamUrl ||
      lesson.video_url ||
      lesson.videoUrl ||
      lesson.original_url ||
      lesson.media_url ||
      lesson.mediaUrl ||
      lesson.external_url ||
      lesson.externalUrl ||
      ''
    ).trim();
  }

  // Extract src if full <iframe> snippet was passed
  const iframeSrcMatch = rawUrl.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    rawUrl = iframeSrcMatch[1].trim();
  }

  if (!rawUrl) return null;

  const resolvedUrl = resolveMediaUrl(rawUrl);
  const lowerUrl = resolvedUrl.toLowerCase();
  const mimeType = (lesson.mime_type || lesson.mimeType || '').toLowerCase();

  // YouTube Detection & ID Extraction
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    let videoId = '';
    const ytMatch = resolvedUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      videoId = ytMatch[1];
    }
    return {
      rawUrl,
      url: resolvedUrl,
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : resolvedUrl,
      kind: 'youtube',
      providerLabel: 'YouTube',
    };
  }

  // Vimeo Detection & ID Extraction
  if (lowerUrl.includes('vimeo.com')) {
    let videoId = '';
    const vimeoMatch = resolvedUrl.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      videoId = vimeoMatch[1];
    }
    return {
      rawUrl,
      url: resolvedUrl,
      embedUrl: videoId ? `https://player.vimeo.com/video/${videoId}` : resolvedUrl,
      kind: 'vimeo',
      providerLabel: 'Vimeo',
    };
  }

  // Wistia Detection
  if (lowerUrl.includes('wistia.')) {
    return {
      rawUrl,
      url: resolvedUrl,
      embedUrl: resolvedUrl,
      kind: 'wistia',
      providerLabel: 'Wistia',
    };
  }

  // HLS Stream Detection (.m3u8)
  if (lowerUrl.includes('.m3u8') || mimeType.includes('mpegurl')) {
    return {
      rawUrl,
      url: resolvedUrl,
      kind: 'hls',
      mimeType: 'application/x-mpegURL',
      providerLabel: 'HLS Stream',
    };
  }

  // Direct HTML5 Video File (.mp4, .webm, .ogg, .mov, uploaded media URL)
  const isDirectFile = (
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.webm') ||
    lowerUrl.includes('.ogg') ||
    lowerUrl.includes('.mov') ||
    lowerUrl.includes('/media/') ||
    lowerUrl.includes('localhost:8000') ||
    lowerUrl.includes('127.0.0.1:8000') ||
    mimeType.startsWith('video/')
  );

  if (isDirectFile) {
    return {
      rawUrl,
      url: resolvedUrl,
      kind: 'direct',
      mimeType: mimeType || 'video/mp4',
      providerLabel: 'HTML5 Video',
    };
  }

  // Fallback Embed ONLY for external third-party URLs (not local media / backend paths)
  if (
    (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')) &&
    !lowerUrl.includes('/media/') &&
    !lowerUrl.includes('localhost:8000') &&
    !lowerUrl.includes('127.0.0.1:8000')
  ) {
    return {
      rawUrl,
      url: resolvedUrl,
      embedUrl: resolvedUrl,
      kind: 'embed',
      providerLabel: 'Web Video Embed',
    };
  }

  return null;
}
