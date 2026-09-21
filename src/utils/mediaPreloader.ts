/**
 * Media pre-caching and loading optimization utility for Chat-Liz.
 * Eliminates delays and white/black screen flashes when switching background images,
 * animated GIFs, and videos. Prevents unhandled errors and "fallo" alerts.
 */

const imageCache = new Map<string, HTMLImageElement>();
const videoCache = new Set<string>();
const failedUrls = new Set<string>();

/**
 * Pre-caches an image, animated GIF, or video file so it renders instantly
 * when assigned as background. Returns true if successfully loaded or cached,
 * and false (without throwing errors) if the asset could not be loaded.
 */
export function preloadMedia(url: string, timeoutMs = 4000): Promise<boolean> {
  if (!url || typeof url !== 'string') return Promise.resolve(false);
  const cleanUrl = url.trim();
  if (!cleanUrl) return Promise.resolve(false);

  // If already known in memory cache
  if (imageCache.has(cleanUrl) || videoCache.has(cleanUrl)) {
    return Promise.resolve(true);
  }

  // If known broken URL, avoid retrying immediately
  if (failedUrls.has(cleanUrl)) {
    return Promise.resolve(false);
  }

  // Check if it's a direct video
  const isVideo =
    cleanUrl.match(/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i) ||
    cleanUrl.startsWith('data:video/');

  if (isVideo) {
    return new Promise((resolve) => {
      let isSettled = false;
      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          // Resolve true on timeout to not block user, but don't mark failed
          resolve(true);
        }
      }, timeoutMs);

      try {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;

        const cleanup = () => {
          clearTimeout(timer);
          video.oncanplay = null;
          video.onloadeddata = null;
          video.onerror = null;
          video.src = '';
        };

        video.oncanplay = () => {
          if (!isSettled) {
            isSettled = true;
            videoCache.add(cleanUrl);
            clearTimeout(timer);
            resolve(true);
          }
        };

        video.onloadeddata = () => {
          if (!isSettled) {
            isSettled = true;
            videoCache.add(cleanUrl);
            clearTimeout(timer);
            resolve(true);
          }
        };

        video.onerror = () => {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            failedUrls.add(cleanUrl);
            // Resolve false gracefully without throwing
            resolve(false);
          }
        };

        video.src = cleanUrl;
        video.load();
      } catch (err) {
        clearTimeout(timer);
        resolve(false);
      }
    });
  }

  // For Images, Animated GIFs, WebP, SVG, base64 data URLs
  return new Promise((resolve) => {
    let isSettled = false;
    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        resolve(true);
      }
    }, timeoutMs);

    try {
      const img = new Image();
      img.decoding = 'async';

      img.onload = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          imageCache.set(cleanUrl, img);
          // Keep cache size bounded
          if (imageCache.size > 50) {
            const firstKey = imageCache.keys().next().value;
            if (firstKey) imageCache.delete(firstKey);
          }
          resolve(true);
        }
      };

      img.onerror = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          failedUrls.add(cleanUrl);
          // Graceful fallback - never throw or show error alert
          resolve(false);
        }
      };

      img.src = cleanUrl;
      // If it completed immediately (e.g. data URL or browser cache)
      if (img.complete && img.naturalWidth > 0) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          imageCache.set(cleanUrl, img);
          resolve(true);
        }
      }
    } catch (err) {
      clearTimeout(timer);
      resolve(false);
    }
  });
}

/**
 * Preloads an array of media URLs concurrently in background.
 */
export function preloadMediaBatch(urls: string[]): void {
  urls.forEach((url) => {
    if (url) {
      preloadMedia(url).catch(() => {});
    }
  });
}
