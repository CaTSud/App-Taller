// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration for App Taller Notifications
const firebaseConfig = {
    apiKey: "AIzaSyBrdpTXXfnjBTmHBOreeuKgxcAoJsVfGqA",
    authDomain: "app-taller-notifications.firebaseapp.com",
    projectId: "app-taller-notifications",
    storageBucket: "app-taller-notifications.firebasestorage.app",
    messagingSenderId: "882885580664",
    appId: "1:882885580664:web:bf5a75ce8186cb76855a8d",
    measurementId: "G-CT5N8VRT70"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'Notificación de App Taller';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes un nuevo aviso de mantenimiento.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click Received.');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
