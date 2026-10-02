/**
 * Firebase Cloud Messaging & Web Push notification client utility for Chat-Liz.
 * Alerts users of private messages, mentions (@user or @Elizabeth)
 * even when the browser tab is in background or minimized.
 */

import { app } from '../firebaseConfig';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[PushNotifications] Push Notifications not supported in this browser.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[PushNotifications] Notification permission:', permission);
    return permission;
  } catch (err) {
    console.error('[PushNotifications] Permission error:', err);
    return 'denied';
  }
}

export function showPushNotification(options: {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  onClick?: () => void;
}) {
  // Check if browser notifications are available and permitted
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const defaultIcon = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elizabeth';
    const notif = new Notification(options.title, {
      body: options.body,
      icon: options.icon || defaultIcon,
      badge: options.badge || defaultIcon,
      tag: options.tag || 'chatliz_msg',
      silent: false,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
      if (options.onClick) options.onClick();
    };
  } catch (e) {
    console.warn('[PushNotifications] Local Notification constructor failed:', e);
  }
}

/**
 * Initializes FCM push notification listener if supported.
 */
export async function setupFirebasePushNotifications(
  onMessageReceived?: (payload: any) => void
) {
  try {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      return null;
    }

    const { getMessaging, onMessage } = await import('firebase/messaging');
    if (app && app.options?.messagingSenderId) {
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        console.log('[FCM Foreground Message]:', payload);
        if (onMessageReceived) onMessageReceived(payload);

        // Show push notification if window is hidden
        if (document.hidden && payload.notification) {
          showPushNotification({
            title: payload.notification.title || 'Chat-Liz',
            body: payload.notification.body || 'Nuevo mensaje',
            icon: payload.notification.icon
          });
        }
      });
      return messaging;
    }
  } catch (err) {
    console.warn('[FCM Setup Note]:', err);
  }
  return null;
}
