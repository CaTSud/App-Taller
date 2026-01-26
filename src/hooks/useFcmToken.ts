'use client';

import { useEffect, useState } from 'react';
import { getFirebaseMessaging } from '@/lib/firebase/config';
import { getToken } from 'firebase/messaging';
import { createClient } from '@/lib/supabase/client';

export const useFcmToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                // Only run in browser environment
                if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
                    return;
                }

                // Check if user is authenticated before requesting FCM token
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    // User not logged in, don't request notifications yet
                    return;
                }

                const messaging = await getFirebaseMessaging();

                if (!messaging) {
                    console.log('Firebase Messaging not supported in this browser');
                    return;
                }

                const permissionResult = await Notification.requestPermission();
                setPermission(permissionResult);

                if (permissionResult === 'granted') {
                    const currentToken = await getToken(messaging, {
                        vapidKey: 'BIy9dYR5mPVG4v0ZFP4fGASwUTnRX6yl_jPxFV6WTrsUZh3zSRqAeBMkjpV1dpbp4sd4HXEByfYS9O1e0XVGdqc'
                    });

                    if (currentToken) {
                        setToken(currentToken);
                        await saveTokenToDatabase(currentToken);
                    } else {
                        console.log('No registration token available.');
                    }
                }
            } catch (err) {
                // Silently handle errors - don't crash the app
                const errorMessage = err instanceof Error ? err.message : 'Unknown FCM error';
                console.warn('FCM initialization skipped:', errorMessage);
                setError(errorMessage);
            }
        };

        retrieveToken();
    }, []);

    return { token, permission };
};

const saveTokenToDatabase = async (token: string) => {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Upsert token
    const { error } = await supabase
        .from('user_fcm_tokens')
        .upsert({
            user_id: user.id,
            token: token,
            device_type: 'web',
            last_seen: new Date().toISOString()
        }, {
            onConflict: 'user_id,token'
        });

    if (error) {
        console.error('Error saving FCM token to database:', error);
    }
};
