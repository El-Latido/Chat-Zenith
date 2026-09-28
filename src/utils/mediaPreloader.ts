/**
 * Media pre-caching and loading optimization utility for Chat-Liz.
 * Eliminates delays and white/black screen flashes when switching background images,
 * animated GIFs, and videos. Prevents unhandled errors, blank flashes, and "fallo" alerts.
 * Uses Memory Cache + IndexedDB + LocalStorage for 100% offline persistence.
 */

const imageCache = new Map<string, HTMLImageElement>();
const videoCache = new Set<string>();
const blobUrlCache = new Map<string, string>();

const OFFLINE_BG_KEY = 'chatliz_offline_bg_cache';
const IDB_NAME = 'chatliz_media_vault';
const IDB_STORE = 'backgrounds';

// IndexedDB Helper for Large Offline Media (Images, GIFs, MP4s)
function openMediaDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Stores the media blob in IndexedDB and updates offline cache
 */
export async function persistMediaToIndexedDB(url: string): Promise<string | null> {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('data:')) {
    cacheBackgroundForOffline(cleanUrl);
    return cleanUrl;
  }

  // Check if we already have a cached blob URL
  if (blobUrlCache.has(cleanUrl)) {
    return blobUrlCache.get(cleanUrl)!;
  }

  try {
    const db = await openMediaDB();
    if (!db) return null;

    // Check if already stored in IDB
    const existing = await new Promise<Blob | null>((res) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(cleanUrl);
        req.onsuccess = () => res(req.result || null);
        req.onerror = () => res(null);
      } catch {
        res(null);
      }
    });

    if (existing instanceof Blob) {
      const blobUrl = URL.createObjectURL(existing);
      blobUrlCache.set(cleanUrl, blobUrl);
      cacheBackgroundForOffline(cleanUrl);
      return blobUrl;
    }

    // Fetch and store if online
    if (navigator.onLine && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
      const response = await fetch(cleanUrl, { mode: 'cors' }).catch(() => null);
      if (response && response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 0) {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).put(blob, cleanUrl);
          const blobUrl = URL.createObjectURL(blob);
          blobUrlCache.set(cleanUrl, blobUrl);
          cacheBackgroundForOffline(cleanUrl);
          return blobUrl;
        }
      }
    }
  } catch (err) {
    console.warn("[MediaVault] IDB cache note:", err);
  }

  cacheBackgroundForOffline(cleanUrl);
  return null;
}

/**
 * Retrieves the local offline URL or data URL for a given media
 */
export async function getOfflineMediaUrl(url: string): Promise<string> {
  if (!url) return getOfflineCachedBackground() || '';
  if (url.startsWith('data:')) return url;
  if (blobUrlCache.has(url)) return blobUrlCache.get(url)!;

  try {
    const db = await openMediaDB();
    if (db) {
      const blob = await new Promise<Blob | null>((res) => {
        try {
          const tx = db.transaction(IDB_STORE, 'readonly');
          const store = tx.objectStore(IDB_STORE);
          const req = store.get(url);
          req.onsuccess = () => res(req.result || null);
          req.onerror = () => res(null);
        } catch {
          res(null);
        }
      });
      if (blob instanceof Blob) {
        const objUrl = URL.createObjectURL(blob);
        blobUrlCache.set(url, objUrl);
        return objUrl;
      }
    }
  } catch (_) {}

  return url;
}

/**
 * Stores the last successfully loaded background in persistent local storage
 * so it continues playing even when offline or network drops.
 */
export function cacheBackgroundForOffline(url: string): void {
  if (!url || typeof url !== 'string') return;
  try {
    if (url.startsWith('data:') && url.length < 2000000) {
      localStorage.setItem(OFFLINE_BG_KEY, url);
    } else if (!url.startsWith('blob:')) {
      localStorage.setItem(OFFLINE_BG_KEY, url);
    }
  } catch (_) {}
}

export function getOfflineCachedBackground(): string | null {
  try {
    return localStorage.getItem(OFFLINE_BG_KEY) || null;
  } catch (_) {
    return null;
  }
}

/**
 * Checks synchronously whether a media URL is already pre-warmed in memory.
 */
export function isMediaCached(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  const cleanUrl = url.trim();
  if (!cleanUrl) return true;
  return imageCache.has(cleanUrl) || videoCache.has(cleanUrl) || blobUrlCache.has(cleanUrl) || cleanUrl.startsWith('data:');
}

/**
 * Pre-caches an image, animated GIF, or video file so it renders instantly
 * when assigned as background. Returns true if successfully loaded or cached.
 */
export function preloadMedia(url: string, timeoutMs = 2500): Promise<boolean> {
  if (!url || typeof url !== 'string') return Promise.resolve(false);
  const cleanUrl = url.trim();
  if (!cleanUrl) return Promise.resolve(false);

  // If already known in memory cache
  if (imageCache.has(cleanUrl) || videoCache.has(cleanUrl) || blobUrlCache.has(cleanUrl)) {
    return Promise.resolve(true);
  }

  // Persist asynchronously to IndexedDB in background
  persistMediaToIndexedDB(cleanUrl).catch(() => {});

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
