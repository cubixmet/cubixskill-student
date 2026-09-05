import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  AlertCircle,
  Loader2,
  Check,
  ExternalLink,
} from 'lucide-react';
import type { CourseLesson } from '../../../../stores/course.store';
import { resolveVideoSource } from '../../utils/videoResolver';
import { Button } from '../../../../components/ui/Button';
import { resolveMediaUrl } from '../../../../services/apiClient';

interface Props {
  lesson: CourseLesson;
}

interface QualityLevel {
  index: number;
  height: number;
  width?: number;
  bitrate: number;
  label: string;
}

function getQualityDescription(height: number): string {
  if (height >= 1080) return 'Full HD';
  if (height >= 720) return 'HD';
  if (height >= 480) return 'SD';
  if (height === 360) return 'Data Saver';
  return '';
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const VideoLessonPlayer: React.FC<Props> = ({ lesson }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [currentPlaybackHeight, setCurrentPlaybackHeight] = useState<number>(0);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  const streamUrl =
    lesson?.stream_url ||
    lesson?.streamUrl ||
    lesson?.primary_media?.stream_url ||
    '';

  const directUrl =
    lesson?.video_url ||
    lesson?.videoUrl ||
    lesson?.media_url ||
    lesson?.mediaUrl ||
    lesson?.original_url ||
    lesson?.primary_media?.original_url ||
    '';

  const processingMode = String(
    lesson?.processing_mode || lesson?.primary_media?.processing_mode || ''
  ).toUpperCase();

  const processingStatus = String(
    lesson?.processing_status || lesson?.primary_media?.processing_status || 'READY'
  ).toUpperCase();

  const isHls =
    Boolean(streamUrl) &&
    (processingMode === 'HLS' || streamUrl.toLowerCase().includes('.m3u8')) &&
    (!processingStatus || processingStatus === 'READY' || processingStatus === 'COMPLETED');

  const resolvedStreamUrl = streamUrl ? resolveMediaUrl(streamUrl) : '';
  const resolvedDirectUrl = directUrl ? resolveMediaUrl(directUrl) : '';
  const resolvedUrl = isHls ? resolvedStreamUrl : resolvedDirectUrl;

  const embedSource = resolveVideoSource(lesson);

  // Auto-hide controls timeout trigger
  const triggerShowControls = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying && !showQualityMenu) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, showQualityMenu]);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  // Close quality menu on click outside or Escape
  useEffect(() => {
    if (!showQualityMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQualityMenu(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowQualityMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQualityMenu]);

  // Keyboard Shortcuts (Space, M, F, Left/Right arrows)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration || 0,
            videoRef.current.currentTime + 5
          );
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isPlaying, isMuted]);

  // Initialize HLS / HTML5 Media
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedUrl) return;

    setVideoError(null);
    setQualities([]);
    setCurrentQuality(-1);
    setCurrentPlaybackHeight(0);
    setShowQualityMenu(false);
    setIsPlaying(false);
    setCurrentTime(0);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = resolvedUrl;
        video.load();
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          autoStartLoad: true,
          startLevel: -1,
        });

        hlsRef.current = hls;

        hls.loadSource(resolvedUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setVideoError(null);

          const sourceLevels = Array.isArray(hls.levels) ? hls.levels : [];
          const byHeight = new Map<number, QualityLevel>();

          sourceLevels.forEach((level, index) => {
            const height = Number(level?.height || 0);
            const width = Number(level?.width || 0);
            const bitrate = Number(level?.bitrate || 0);

            if (height <= 0) {
              return;
            }

            const candidate: QualityLevel = {
              index,
              height,
              width,
              bitrate,
              label: `${height}p`,
            };

            const existing = byHeight.get(height);

            // If duplicate resolutions exist, keep the higher bitrate variant.
            if (!existing || bitrate > existing.bitrate) {
              byHeight.set(height, candidate);
            }
          });

          const parsed = Array.from(byHeight.values()).sort(
            (a, b) => b.height - a.height
          );

          setQualities(parsed);

          if (import.meta.env.DEV) {
            console.log('[Student HLS Levels]', sourceLevels);
            console.log('[Student HLS Qualities]', parsed);
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          const level = hls.levels?.[data.level];

          setCurrentPlaybackHeight(Number(level?.height || 0));

          if (hls.autoLevelEnabled) {
            setCurrentQuality(-1);
          } else {
            setCurrentQuality(data.level);
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('[Student HLS Error]', data);
          if (!data.fatal) return;

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;

            default:
              hls.destroy();
              hlsRef.current = null;
              if (resolvedDirectUrl && !resolvedDirectUrl.endsWith('.m3u8')) {
                video.src = resolvedDirectUrl;
                video.load();
              } else {
                setVideoError('Unable to play HLS video stream.');
              }
              break;
          }
        });
      } else {
        setVideoError('HLS streaming is not supported in this browser.');
      }
    } else {
      video.src = resolvedUrl;
      video.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute('src');
      video.load();
    };
  }, [resolvedUrl, isHls, resolvedDirectUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const target = containerRef.current || videoRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if ((target as any).webkitRequestFullscreen) {
        (target as any).webkitRequestFullscreen();
      }
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    const hls = hlsRef.current;

    if (!hls) {
      return;
    }

    if (levelIndex === -1) {
      hls.currentLevel = -1;
      hls.loadLevel = -1;
      hls.nextLoadLevel = -1;

      setCurrentQuality(-1);
      setShowQualityMenu(false);
      return;
    }

    const levelExists = hls.levels?.[levelIndex];

    if (!levelExists) {
      return;
    }

    hls.loadLevel = levelIndex;
    hls.nextLoadLevel = levelIndex;

    setCurrentQuality(levelIndex);
    setShowQualityMenu(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 1. Processing State Check
  if (processingMode === 'HLS' && ['QUEUED', 'PENDING', 'PROCESSING'].includes(processingStatus)) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <h4 className="font-bold text-sm text-indigo-200">Preparing Adaptive HLS Streaming...</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Backend is generating multi-quality video renditions for optimal playback performance.
        </p>
      </div>
    );
  }

  // 2. Failed Processing State Check
  if (processingStatus === 'FAILED') {
    return (
      <div className="w-full aspect-video rounded-2xl bg-rose-950/90 border border-rose-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <h4 className="font-bold text-sm text-rose-200">Adaptive Video Stream Error</h4>
        <p className="text-xs text-rose-300 max-w-sm">
          Video processing encountered an error on the server.
        </p>
      </div>
    );
  }

  // 3. Embed Renderers (YouTube / Vimeo / Wistia / Third-Party Embeds)
  if (
    embedSource &&
    !resolvedUrl &&
    (embedSource.kind === 'youtube' ||
      embedSource.kind === 'vimeo' ||
      embedSource.kind === 'wistia' ||
      embedSource.kind === 'embed')
  ) {
    const embedSrc = embedSource.embedUrl || embedSource.url;
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

  // 4. Missing Source Error State
  if (!resolvedUrl) {
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

  // 5. Playback Error State
  if (videoError) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-rose-950/90 border border-rose-800 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <h4 className="font-bold text-sm text-rose-200">Unable to Play Video</h4>
        <p className="text-xs text-rose-300 max-w-sm">{videoError}</p>
        {resolvedUrl.startsWith('http') && (
          <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="pt-2">
            <Button size="sm" variant="outline" leftIcon={<ExternalLink className="w-4 h-4" />}>
              Open Video Directly
            </Button>
          </a>
        )}
      </div>
    );
  }

  // 6. Instructor-Style Video Player Component
  return (
    <div
      ref={containerRef}
      onMouseMove={triggerShowControls}
      onTouchStart={triggerShowControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative aspect-video w-full max-h-80 bg-slate-950 rounded-xl overflow-hidden shadow-2xl group flex items-center justify-center select-none"
    >
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        poster={lesson.thumbnailUrl || (lesson as any).thumbnail}
        onPlay={() => {
          setIsPlaying(true);
          triggerShowControls();
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          setVideoError(null);
          if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
          }
        }}
        onError={() => setVideoError('HTML5 Video Error: Source unavailable.')}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer bg-black"
      />

      {/* Instructor-Style Control Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-3 flex flex-col justify-between transition-opacity duration-300 ${
          showControls || !isPlaying || showQualityMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Bar: Title */}
        <div className="flex items-center justify-between text-white text-xs font-medium pointer-events-auto">
          <span className="truncate max-w-[240px] sm:max-w-md font-semibold text-slate-200">
            {lesson.title || 'Video Player'}
          </span>
        </div>

        {/* Bottom Bar: Progress Bar + Control Row */}
        <div className="space-y-2 pointer-events-auto w-full">
          {/* Progress Timeline Slider */}
          <div className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer transition-all group/track flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div
              className="h-full bg-indigo-500 group-hover/track:bg-indigo-400 rounded-full relative transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/track:scale-100 transition-transform" />
            </div>
          </div>

          {/* Bottom Control Buttons */}
          <div className="flex items-center justify-between text-white">
            {/* Left Controls: Play/Pause, Mute, Time */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white text-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-white/80 hover:text-white transition cursor-pointer shrink-0"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="text-xs text-white/90 font-medium whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls: Quality Menu, Fullscreen */}
            <div className="flex items-center gap-2 shrink-0">
              {/* HLS Quality Selector (Always visible on bottom row for active HLS streams with qualities available) */}
              {isHls && qualities.length > 0 && (
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowQualityMenu((open) => !open)}
                    aria-label="Playback quality"
                    aria-expanded={showQualityMenu}
                    aria-haspopup="menu"
                    className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5 shrink-0" />
                    <span className="leading-none">
                      {currentQuality === -1
                        ? 'Auto'
                        : qualities.find((q) => q.index === currentQuality)?.label || 'Auto'}
                    </span>
                  </button>

                  {/* Quality Dropdown Menu */}
                  {showQualityMenu && (
                    <div
                      role="menu"
                      className="absolute right-0 bottom-full mb-2 min-w-[150px] overflow-hidden rounded-xl border border-white/10 bg-black/90 backdrop-blur-md shadow-xl z-50 py-1 text-xs text-slate-200"
                    >
                      {/* Auto Option */}
                      <button
                        type="button"
                        onClick={() => handleQualityChange(-1)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-white/10 font-medium flex items-center justify-between transition cursor-pointer ${
                          currentQuality === -1 ? 'text-indigo-400 font-bold bg-white/5' : 'text-slate-200'
                        }`}
                      >
                        <span>Auto</span>
                        {currentQuality === -1 && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
                      </button>

                      {/* Manual Quality Options */}
                      {qualities.map((quality) => {
                        const selected = currentQuality === quality.index;

                        return (
                          <button
                            key={quality.index}
                            type="button"
                            onClick={() => handleQualityChange(quality.index)}
                            className={`w-full text-left px-3 py-1.5 hover:bg-white/10 font-medium flex items-center justify-between transition cursor-pointer ${
                              selected ? 'text-indigo-400 font-bold bg-white/5' : 'text-slate-200'
                            }`}
                          >
                            <span>{quality.label}</span>
                            {selected && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                className="text-white/80 hover:text-white transition cursor-pointer shrink-0"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
