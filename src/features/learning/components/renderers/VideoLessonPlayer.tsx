import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, ExternalLink } from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveVideoSource } from '../../utils/videoResolver';
import { Button } from '../../../../components/ui/Button';

interface Props {
  lesson: CourseLesson;
}

export const VideoLessonPlayer: React.FC<Props> = ({ lesson }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoSource = resolveVideoSource(lesson);
  const src = videoSource?.url || '';
  const isHls = videoSource?.kind === 'hls' || src.includes('.m3u8');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setVideoError(null);

    if (isHls) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari / iOS)
        video.src = src;
      } else if (Hls.isSupported()) {
        // HLS.js for Chrome, Firefox, Edge, etc.
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          autoStartLoad: true,
          enableWorker: true,
        });
        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('[HLS Fatal Error]', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('[HLS] Network error encountered, attempting recovery...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('[HLS] Media error encountered, attempting recovery...');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setVideoError('Unable to play HLS video stream.');
                break;
            }
          }
        });

        return () => {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } else {
        setVideoError('HLS streaming is not supported in this browser.');
      }
    } else {
      // Direct MP4 / WebM / OGG playback
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        try {
          video.pause();
          video.removeAttribute('src');
          video.load();
        } catch (_) {}
      }
    };
  }, [src, isHls, lesson.id]);

  if (!videoSource || !videoSource.url) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-400" />
        <h4 className="font-semibold text-xs text-slate-200">Video Source Unavailable</h4>
        <p className="text-[11px] text-slate-400 max-w-sm">
          No valid video media file or playback URL was provided for this unit.
        </p>
      </div>
    );
  }

  if (videoError) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <h4 className="font-semibold text-xs text-slate-200">Unable to Play Video</h4>
        <p className="text-[11px] text-slate-400 max-w-sm">{videoError}</p>
        {videoSource.url.startsWith('http') && (
          <a href={videoSource.url} target="_blank" rel="noopener noreferrer" className="pt-2">
            <Button size="sm" variant="outline" leftIcon={<ExternalLink className="w-4 h-4" />}>
              Open External Video
            </Button>
          </a>
        )}
      </div>
    );
  }

  // Embed Renderers (YouTube / Vimeo / Wistia / Custom Embed IFrame)
  if (
    videoSource.kind === 'youtube' ||
    videoSource.kind === 'vimeo' ||
    videoSource.kind === 'wistia' ||
    videoSource.kind === 'embed'
  ) {
    const embedSrc = videoSource.embedUrl || videoSource.url;
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-md border border-slate-800">
        <iframe
          key={`${lesson.id}-${embedSrc}`}
          src={embedSrc}
          title={lesson.title || 'Video Lesson'}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  // Direct HTML5 Video & HLS Stream Player
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-md border border-slate-800">
      <video
        key={`${lesson.id}-${videoSource.url}`}
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={lesson.thumbnailUrl}
        onLoadedMetadata={() => setVideoError(null)}
        onError={() => setVideoError('Unable to load or play this media stream.')}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
};
