import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

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

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Messaging export (only supported in browser environments)
export const getFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

export default app;
