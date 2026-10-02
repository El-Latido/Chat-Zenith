/**
 * Local offline message queue management for Chat-Liz.
 * Allows messages sent while disconnected to be cached in localStorage
 * and automatically dispatched sequentially when the connection recovers.
 */

export interface QueuedMessage {
  id: string;
  chat: string;
  sender: string;
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
  gifUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  replyTo?: any;
  queuedAt: number;
  tavilyKey?: string;
  webSearch?: boolean;
}

const OFFLINE_QUEUE_KEY = 'chatliz_offline_queue';

export function getOfflineQueue(): QueuedMessage[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('[OfflineQueue] Error reading from localStorage:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: QueuedMessage[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('[OfflineQueue] Error saving to localStorage:', e);
  }
}

export function enqueueOfflineMessage(msg: Omit<QueuedMessage, 'id' | 'queuedAt'> & { id?: string }): QueuedMessage {
  const queue = getOfflineQueue();
  const queuedItem: QueuedMessage = {
    ...msg,
    id: msg.id || `queued_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    queuedAt: Date.now()
  };
  queue.push(queuedItem);
  saveOfflineQueue(queue);
  console.log(`[OfflineQueue] Message enqueued (${queue.length} in queue):`, queuedItem.id);
  return queuedItem;
}

export function removeOfflineMessage(id: string): void {
  const queue = getOfflineQueue().filter(m => m.id !== id);
  saveOfflineQueue(queue);
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch {}
}

/**
 * Dispatches all pending queued messages via the active socket connection.
 */
export async function syncOfflineQueue(
  socket: any,
  onSynced?: (syncedCount: number) => void
): Promise<number> {
  if (!socket || !socket.connected) {
    console.log('[OfflineQueue] Cannot sync: socket is not connected.');
    return 0;
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  console.log(`[OfflineQueue] Syncing ${queue.length} pending messages...`);
  let count = 0;

  for (const item of queue) {
    try {
      const payload = {
        id: item.id,
        text: item.text,
        sender: item.sender,
        createdAt: item.queuedAt,
        image: item.imageUrl,
        gif: item.gifUrl,
        audio: item.audioUrl,
        file: item.fileUrl ? { url: item.fileUrl, name: item.fileName, type: item.fileType } : undefined,
        replyTo: item.replyTo,
        tavilyKey: item.tavilyKey,
        webSearch: item.webSearch
      };

      if (item.chat === 'global') {
        socket.emit('message', payload);
      } else {
        socket.emit('private_message', payload, item.chat);
      }
      count++;
    } catch (err) {
      console.error('[OfflineQueue] Error sending queued message:', item.id, err);
    }
  }

  clearOfflineQueue();
  if (onSynced && count > 0) {
    onSynced(count);
  }
  return count;
}
