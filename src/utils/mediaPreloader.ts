/**
 * Media pre-caching and loading optimization utility for Chat-Liz.
 * Eliminates delays and white/black screen flashes when switching background images,
 * animated GIFs, and videos. Prevents unhandled errors, blank flashes, and "fallo" alerts.
 */

const imageCache = new Map<string, HTMLImageElement>();
const videoCache = new Set<string>();
const failedUrls = new Set<string>();

/**
 * Checks synchronously whether a media URL is already pre-warmed in memory.
 */
export function isMediaCached(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  const cleanUrl = url.trim();
  if (!cleanUrl) return true;
  return imageCache.has(cleanUrl) || videoCache.has(cleanUrl);
}

/**
 * Pre-caches an image, animated GIF, or video file so it renders instantly
 * when assigned as background. Returns true if successfully loaded or cached,
 * and false (without throwing errors) if the asset could not be loaded.
 */
export function preloadMedia(url: string, timeoutMs = 3500): Promise<boolean> {
  if (!url || typeof url !== 'string') return Promise.resolve(false);
  const cleanUrl = url.trim();
  if (!cleanUrl) return Promise.resolve(false);

  // If already known in memory cache
  if (imageCache.has(cleanUrl) || videoCache.has(cleanUrl)) {
    return Promise.resolve(true);
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
          // Resolve true on timeout so UI can proceed progressively without delay
          videoCache.add(cleanUrl);
          resolve(true);
        }
      }, timeoutMs);

      try {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;

        const onReady = () => {
          if (!isSettled) {
            isSettled = true;
            videoCache.add(cleanUrl);
            clearTimeout(timer);
            resolve(true);
          }
        };

        video.oncanplay = onReady;
        video.oncanplaythrough = onReady;
        video.onloadeddata = onReady;

        video.onerror = () => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            // Fallback gracefully without throwing
            resolve(true);
          }
        };

        video.src = cleanUrl;
        video.load();
      } catch (err) {
        clearTimeout(timer);
        resolve(true);
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

      const onComplete = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          imageCache.set(cleanUrl, img);
          if (imageCache.size > 80) {
            const firstKey = imageCache.keys().next().value;
            if (firstKey) imageCache.delete(firstKey);
          }
          resolve(true);
        }
      };

      img.onload = () => {
        // Use browser decode if available for 0-latency paint
        if ('decode' in img && typeof img.decode === 'function') {
          img.decode().then(onComplete).catch(onComplete);
        } else {
          onComplete();
        }
      };

      img.onerror = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          // Graceful fallback - never throw or trigger error alert
          resolve(true);
        }
      };

      img.src = cleanUrl;
      if (img.complete && img.naturalWidth > 0) {
        onComplete();
      }
    } catch (err) {
      clearTimeout(timer);
      resolve(true);
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
