import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import {
  preloadMedia,
  isMediaCached,
  cacheBackgroundForOffline,
  getOfflineCachedBackground,
  getOfflineMediaUrl,
  persistMediaToIndexedDB
} from '../utils/mediaPreloader';

export interface UniversalBackgroundProps {
  url: string | null | undefined;
  opacity?: number;
  className?: string;
  enableSound?: boolean;
  isContainer?: boolean;
}

export type MediaBackgroundType =
  | 'youtube'
  | 'pinterest'
  | 'video'
  | 'image'
  | 'webpage'
  | 'none';

export interface ParsedBackgroundMedia {
  type: MediaBackgroundType;
  src: string;
  originalUrl: string;
  embedUrl?: string;
  label: string;
  icon: string;
}

/**
 * Parses any URL (YouTube, Pinterest, MP4/WebM/MOV video, GIF, image, webpage)
 * into a standardized media background representation.
 */
export function parseBackgroundMedia(rawUrl: string | null | undefined): ParsedBackgroundMedia {
  let url = rawUrl && typeof rawUrl === 'string' ? rawUrl.trim() : '';

  if (!url) {
    const offlineCached = getOfflineCachedBackground();
    if (offlineCached && typeof offlineCached === 'string') {
      url = offlineCached.trim();
    }
  }

  if (!url) {
    return {
      type: 'none',
      src: '',
      originalUrl: '',
      label: 'Sin fondo',
      icon: '🎨',
    };
  }

  // 1. YouTube detection (watch, share, embed, shorts)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1`;
    return {
      type: 'youtube',
      src: embedUrl,
      originalUrl: url,
      embedUrl,
      label: 'Video de YouTube (Reproducción Continua)',
      icon: '▶️',
    };
  }

  // 2. Pinterest detection
  if (/pinimg\.com\/.+\.(mp4|webm|mov)/i.test(url)) {
    return {
      type: 'video',
      src: url,
      originalUrl: url,
      label: 'Video de Pinterest',
      icon: '📌',
    };
  }
  if (/pinimg\.com\/.+\.(jpg|jpeg|png|gif|webp)/i.test(url)) {
    return {
      type: 'image',
      src: url,
      originalUrl: url,
      label: 'Imagen de Pinterest',
      icon: '📌',
    };
  }
  const pinMatch = url.match(/pinterest\.[a-z.]+\/pin\/(\d+)/i);
  if (pinMatch && pinMatch[1]) {
    const pinId = pinMatch[1];
    const embedUrl = `https://assets.pinterest.com/ext/embed.html?id=${pinId}`;
    return {
      type: 'pinterest',
      src: embedUrl,
      originalUrl: url,
      embedUrl,
      label: 'Pin de Pinterest',
      icon: '📌',
    };
  }
  if (/pin\.it\/|pinterest\.com/i.test(url)) {
    return {
      type: 'pinterest',
      src: url,
      originalUrl: url,
      embedUrl: url,
      label: 'Página de Pinterest',
      icon: '📌',
    };
  }

  // 3. Direct video files (MP4, WebM, OGG, MOV, M4V, MKV or data:video)
  if (
    url.match(/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i) ||
    url.startsWith('data:video/')
  ) {
    return {
      type: 'video',
      src: url,
      originalUrl: url,
      label: 'Video en Bucle',
      icon: '🎬',
    };
  }

  // 4. Standard and Animated Image formats (JPG, PNG, GIF, WEBP, SVG, DiceBear, Imgur, data:image)
  if (
    url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i) ||
    url.startsWith('data:image/') ||
    url.startsWith('blob:') ||
    url.includes('images.unsplash.com') ||
    url.includes('api.dicebear.com') ||
    url.includes('i.imgur.com')
  ) {
    return {
      type: 'image',
      src: url,
      originalUrl: url,
      label: 'Imagen / GIF de Fondo',
      icon: '🖼️',
    };
  }

  // 5. General Webpage / Streaming Site / Any web link
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return {
      type: 'webpage',
      src: url,
      originalUrl: url,
      embedUrl: url,
      label: 'Sitio Web / Página en Vivo',
      icon: '🌐',
    };
  }

  // Fallback to image
  return {
    type: 'image',
    src: url,
    originalUrl: url,
    label: 'Fondo Personalizado',
    icon: '🎨',
  };
}

export function UniversalBackground({
  url,
  opacity = 0.75,
  className = '',
  enableSound = false,
  isContainer = true,
}: UniversalBackgroundProps) {
  const targetMedia = useMemo(() => parseBackgroundMedia(url), [url]);
  const [activeMedia, setActiveMedia] = useState<ParsedBackgroundMedia>(targetMedia);
  const [resolvedSrc, setResolvedSrc] = useState<string>(targetMedia.src);
  const [isMediaLoaded, setIsMediaLoaded] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sound state: user preference stored in localStorage
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    if (enableSound) return false;
    const saved = localStorage.getItem('chatliz_bg_muted');
    return saved === null ? true : saved === 'true';
  });

  // Resolve offline local blob URL if needed
  useEffect(() => {
    let isCurrent = true;
    if (targetMedia.src) {
      getOfflineMediaUrl(targetMedia.src).then((localUrl) => {
        if (isCurrent && localUrl && localUrl !== resolvedSrc) {
          setResolvedSrc(localUrl);
        }
      });
      persistMediaToIndexedDB(targetMedia.src).catch(() => {});
    }
    return () => {
      isCurrent = false;
    };
  }, [targetMedia.src]);

  // Smooth media swap without black/gray flashes
  useEffect(() => {
    if (!targetMedia.src || targetMedia.type === 'none') {
      const fallback = getOfflineCachedBackground();
      if (fallback) {
        setActiveMedia(parseBackgroundMedia(fallback));
      }
      return;
    }

    let isCurrent = true;

    preloadMedia(targetMedia.src)
      .then(() => {
        if (isCurrent) {
          setActiveMedia(targetMedia);
          setIsMediaLoaded(true);
          cacheBackgroundForOffline(targetMedia.src);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setActiveMedia(targetMedia);
          setIsMediaLoaded(true);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [targetMedia]);

  const media = activeMedia;
  const currentSrc = resolvedSrc || media.src;

  // Keep video continuously playing without pausing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || media.type !== 'video') return;

    video.loop = true;
    video.playsInline = true;
    video.muted = isAudioMuted;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (err) {
        video.muted = true;
        try {
          await video.play();
        } catch (_) {}
      }
    };

    playVideo();
  }, [currentSrc, media.type, isAudioMuted]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    localStorage.setItem('chatliz_bg_muted', String(nextMuted));
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 0.8;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  if ((media.type === 'none' || !currentSrc) && !getOfflineCachedBackground()) {
    return null;
  }

  const isVideoWithSoundCandidate = media.type === 'video' || media.type === 'youtube';

  const containerClasses = isContainer
    ? `absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-500 ease-in-out ${className}`
    : `fixed inset-0 w-screen h-screen min-w-full min-h-full pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700 ease-in-out ${className}`;

  return (
    <div
      className={containerClasses}
      style={{ opacity }}
    >
      {/* 1. YouTube Video Embed */}
      {media.type === 'youtube' && (
        <div className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden transition-opacity duration-300 ${isMediaLoaded ? 'opacity-100' : 'opacity-80'}`}>
          <iframe
            src={`${media.src}&mute=${isAudioMuted ? 1 : 0}`}
            title="Chat-Liz Background Video"
            className="w-full h-full border-0 pointer-events-none object-cover"
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
            onLoad={() => setIsMediaLoaded(true)}
          />
        </div>
      )}

      {/* 2. Direct Video File - Infinite loop with offline memory */}
      {media.type === 'video' && (
        <video
          ref={videoRef}
          autoPlay
          loop
          playsInline
          muted={isAudioMuted}
          preload="auto"
          src={currentSrc}
          className={`absolute inset-0 w-full h-full object-cover min-w-full min-h-full transition-opacity duration-300 ${isMediaLoaded ? 'opacity-100' : 'opacity-80'}`}
          onCanPlay={() => {
            setIsMediaLoaded(true);
            cacheBackgroundForOffline(currentSrc);
          }}
          onLoadedData={() => {
            setIsMediaLoaded(true);
            cacheBackgroundForOffline(currentSrc);
          }}
          onEnded={(e) => {
            try {
              e.currentTarget.currentTime = 0;
              e.currentTarget.play();
            } catch (_) {}
          }}
          onError={(e) => {
            // If direct remote url fails, fallback to offline cached background
            const cached = getOfflineCachedBackground();
            if (cached && cached !== currentSrc) {
              (e.currentTarget as HTMLVideoElement).src = cached;
            }
            setIsMediaLoaded(true);
          }}
        />
      )}

      {/* 3. Image, Animated GIF or WebP - Preserves animated frames & continuous render */}
      {media.type === 'image' && (
        <div className="absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-300 opacity-100">
          <img
            src={currentSrc}
            alt="Fondo Chat-Liz"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover min-w-full min-h-full pointer-events-none select-none"
            onLoad={() => {
              setIsMediaLoaded(true);
              cacheBackgroundForOffline(currentSrc);
            }}
            onError={(e) => {
              const cached = getOfflineCachedBackground();
              if (cached && cached !== currentSrc) {
                (e.currentTarget as HTMLImageElement).src = cached;
              }
              setIsMediaLoaded(true);
            }}
          />
        </div>
      )}

      {/* 4. Pinterest or Generic Webpage */}
      {(media.type === 'pinterest' || media.type === 'webpage') && (
        <div className="absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-300 opacity-100">
          <iframe
            src={media.src}
            title="Chat-Liz Background Page"
            className="w-full h-full border-0 pointer-events-none object-cover"
            sandbox="allow-scripts allow-same-origin"
            loading="eager"
            onLoad={() => setIsMediaLoaded(true)}
          />
        </div>
      )}

      {/* Audio Mute/Unmute Floating Button for Background Videos */}
      {isVideoWithSoundCandidate && (
        <div className="absolute bottom-4 right-4 pointer-events-auto z-30">
          <button
            type="button"
            onClick={toggleSound}
            className="bg-black/70 hover:bg-black/90 text-white/90 hover:text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md shadow-lg transition-transform active:scale-95 flex items-center gap-2 text-xs"
            title={isAudioMuted ? "Activar sonido del fondo" : "Silenciar fondo"}
          >
            {isAudioMuted ? (
              <>
                <VolumeX size={16} className="text-red-400" />
                <span className="hidden sm:inline font-mono font-medium">Fondo Mudo</span>
              </>
            ) : (
              <>
                <Volume2 size={16} className="text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline font-mono font-medium">Sonido ON</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
