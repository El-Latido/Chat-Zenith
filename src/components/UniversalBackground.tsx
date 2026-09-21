import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export interface UniversalBackgroundProps {
  url: string | null | undefined;
  opacity?: number;
  className?: string;
  enableSound?: boolean;
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
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      type: 'none',
      src: '',
      originalUrl: '',
      label: 'Sin fondo',
      icon: '🎨',
    };
  }

  const url = rawUrl.trim();
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
  // Check if it's a direct pin image/video from pinimg
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
  // Pinterest pin page (e.g. pinterest.com/pin/123456789 or pin.it/...)
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
  opacity = 0.65,
  className = '',
  enableSound = false,
}: UniversalBackgroundProps) {
  const media = useMemo(() => parseBackgroundMedia(url), [url]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Sound state: user preference stored in localStorage
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    if (enableSound) return false;
    const saved = localStorage.getItem('chatliz_bg_muted');
    return saved === null ? true : saved === 'true';
  });

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
        // Fallback: browser blocked unmuted autoplay, mute and resume instantly
        video.muted = true;
        try {
          await video.play();
        } catch (e) {
          console.warn("Video autoplay fallback:", e);
        }
      }
    };

    playVideo();
  }, [media.src, media.type, isAudioMuted]);

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

  if (media.type === 'none' || !media.src) {
    return null;
  }

  const isVideoWithSoundCandidate = media.type === 'video' || media.type === 'youtube';

  return (
    <div
      className={`fixed inset-0 w-screen h-screen min-w-full min-h-full pointer-events-none overflow-hidden select-none z-[-1] ${className}`}
      style={{ opacity }}
    >
      {/* 1. YouTube Video Embed */}
      {media.type === 'youtube' && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          <iframe
            src={`${media.src}&mute=${isAudioMuted ? 1 : 0}`}
            title="Chat-Liz Background Video"
            className="w-[125vw] h-[125vh] min-w-[125vw] min-h-[125vh] -translate-x-[12.5vw] -translate-y-[12.5vh] border-0 pointer-events-none object-cover"
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
          />
        </div>
      )}

      {/* 2. Direct Video File - Infinite loop with sound support */}
      {media.type === 'video' && (
        <video
          ref={videoRef}
          autoPlay
          loop
          playsInline
          muted={isAudioMuted}
          src={media.src}
          className="absolute inset-0 w-full h-full object-cover min-w-full min-h-full"
          onEnded={(e) => {
            // Guarantee infinite loop without pause
            try {
              e.currentTarget.currentTime = 0;
              e.currentTarget.play();
            } catch {}
          }}
          onError={(e) => {
            console.warn("Background video error, attempting reload:", e);
          }}
        />
      )}

      {/* 3. Image, Animated GIF or WebP - Preserves animated frames & perfect aspect ratio */}
      {media.type === 'image' && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={media.src}
            alt="Fondo Chat-Liz"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover min-w-full min-h-full transition-opacity duration-300 pointer-events-none select-none"
          />
        </div>
      )}

      {/* 4. Pinterest or Generic Webpage */}
      {(media.type === 'pinterest' || media.type === 'webpage') && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <iframe
            src={media.src}
            title="Chat-Liz Background Page"
            className="w-full h-full border-0 pointer-events-none object-cover"
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin"
            tabIndex={-1}
          />
        </div>
      )}

      {/* Dark gradient overlay to preserve chat readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none" />

      {/* Floating Sound Toggle for Video Backgrounds */}
      {isVideoWithSoundCandidate && (
        <div className="absolute bottom-4 right-4 pointer-events-auto z-20">
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg transition-all active:scale-95"
            title={isAudioMuted ? "Activar sonido del fondo" : "Silenciar sonido del fondo"}
          >
            {isAudioMuted ? (
              <>
                <VolumeX size={14} className="text-gray-400" />
                <span className="hidden sm:inline text-gray-300">Sonido Fondo: Off</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-cyan-400 animate-pulse" />
                <span className="text-cyan-300 font-bold">Sonido Fondo: On</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
