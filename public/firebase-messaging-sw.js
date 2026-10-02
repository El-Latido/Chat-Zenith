// Firebase Messaging Service Worker for background push notifications
/* eslint-disable no-restricted-globals */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBgTuV7xHa3PAPSzacRsEkcnJ59Fukye1A",
  authDomain: "eighth-ability-8szp9.firebaseapp.com",
  projectId: "eighth-ability-8szp9",
  storageBucket: "eighth-ability-8szp9.firebasestorage.app",
  messagingSenderId: "389253128291",
  appId: "1:389253128291:web:087a456f72bbc4bf0b1856"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  const notificationTitle = payload.notification?.title || 'Chat-Liz Notificación';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes un nuevo mensaje en Chat-Liz',
    icon: payload.notification?.icon || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elizabeth',
    badge: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elizabeth'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
