import React, { useMemo } from 'react';

export interface UniversalBackgroundProps {
  url: string | null | undefined;
  opacity?: number;
  className?: string;
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
}: UniversalBackgroundProps) {
  const media = useMemo(() => parseBackgroundMedia(url), [url]);

  if (media.type === 'none' || !media.src) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-[-1] ${className}`}
      style={{ opacity }}
    >
      {/* 1. YouTube Video Embed */}
      {media.type === 'youtube' && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          <iframe
            src={media.src}
            title="Chat-Liz Background Video"
            className="w-[120vw] h-[120vh] min-w-[120vw] min-h-[120vh] -translate-x-[10vw] -translate-y-[10vh] border-0 pointer-events-none object-cover"
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
          />
        </div>
      )}

      {/* 2. Direct Video File */}
      {media.type === 'video' && (
        <video
          autoPlay
          loop
          muted
          playsInline
          src={media.src}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 3. Image, Animated GIF or Avatar */}
      {media.type === 'image' && (
        <div
          className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat transition-all duration-300"
          style={{ backgroundImage: `url("${media.src}")` }}
        />
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
    </div>
  );
}
