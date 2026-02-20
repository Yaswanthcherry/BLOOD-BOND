// Firebase Cloud Messaging initialization for browser push notifications

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAEB4fmnf3Jdn3QyGivioFGCZtrLSaojw",
    authDomain: "bloodbond-beeee.firebaseapp.com",
    projectId: "bloodbond-beeee",
    storageBucket: "bloodbond-beeee.appspot.com",
    messagingSenderId: "74866742050",
    appId: "1:74866742050:web:ffa7cfa14035951689cb7b"
};

let messaging = null;

// Initialize Firebase
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded');
        return false;
    }

    try {
        firebase.initializeApp(firebaseConfig);
        messaging = firebase.messaging();
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Request notification permission and get FCM token
async function requestNotificationPermission() {
    if (!messaging) {
        console.warn('Firebase messaging not initialized');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('Notification permission granted');
            
            // Get FCM token
            const token = await messaging.getToken({
                vapidKey: 'BBoI5YrUD-4uWt-N8a97XYPyc3rlOFkPSxJ8o79eVX_AFZqg1rpveWQ157sFdOaHUFPg20JrVnB0rdKkz5EDoJM'
            });
            
            console.log('FCM Token:', token);
            
            // Save token to localStorage and send to server
            localStorage.setItem('fcm_token', token);
            await saveFCMTokenToServer(token);
            
            return token;
        } else {
            console.log('Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
}

// Save FCM token to server
async function saveFCMTokenToServer(token) {
    const donorEmail = localStorage.getItem('donorEmail');
    if (!donorEmail) return;

    try {
        const response = await fetch('/api/donors/fcm-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: donorEmail, fcmToken: token })
        });
        
        if (response.ok) {
            console.log('FCM token saved to server');
        }
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
}

// Handle foreground messages
function setupForegroundMessageHandler() {
    if (!messaging) return;

    messaging.onMessage((payload) => {
        console.log('Foreground message received:', payload);

        const notificationTitle = payload.notification.title || 'Blood Bond Alert';
        const notificationOptions = {
            body: payload.notification.body || 'New notification',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'blood-bond-notification',
            requireInteraction: true
        };

        // Show notification
        if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
        }

        // Show in-app alert
        showInAppNotification(payload.notification);
    });
}

// Show in-app notification banner
function showInAppNotification(notification) {
    const banner = document.createElement('div');
    banner.className = 'fcm-notification-banner';
    banner.innerHTML = `
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 400px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">🚨 ${notification.title}</h3>
            <p style="margin: 0; font-size: 14px;">${notification.body}</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; background: white; color: #dc2626; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: 600;">Close</button>
        </div>
    `;
    document.body.appendChild(banner);

    // Auto-remove after 10 seconds
    setTimeout(() => banner.remove(), 10000);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (initializeFirebase()) {
            setupForegroundMessageHandler();
        }
    });
} else {
    if (initializeFirebase()) {
        setupForegroundMessageHandler();
    }
}

// Export functions for use in other scripts
window.BloodBondFCM = {
    requestPermission: requestNotificationPermission,
    getToken: () => localStorage.getItem('fcm_token')
};
