// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBAEB4fmnf3Jdn3QyGivioFGCZtrLSaojw",
    authDomain: "bloodbond-beeee.firebaseapp.com",
    projectId: "bloodbond-beeee",
    storageBucket: "bloodbond-beeee.appspot.com",
    messagingSenderId: "74866742050",
    appId: "1:74866742050:web:ffa7cfa14035951689cb7b"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title || 'Blood Bond Alert';
    const notificationOptions = {
        body: payload.notification.body || 'New notification from Blood Bond',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'blood-bond-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Details'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
