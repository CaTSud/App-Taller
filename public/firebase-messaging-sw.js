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
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png' // Ensure this icon exists in public folder
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
