'use client';

import { useEffect, useState } from 'react';
import { getFirebaseMessaging } from '@/lib/firebase/config';
import { getToken } from 'firebase/messaging';
import { createClient } from '@/lib/supabase/client';

export const useFcmToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                    const messaging = await getFirebaseMessaging();

                    if (!messaging) return;

                    const permissionResult = await Notification.requestPermission();
                    setPermission(permissionResult);

                    if (permissionResult === 'granted') {
                        const currentToken = await getToken(messaging, {
                            vapidKey: 'YOUR_VAPID_KEY_HERE' // Optional, but recommended to add if you have one
                        });

                        if (currentToken) {
                            setToken(currentToken);
                            await saveTokenToDatabase(currentToken);
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                        }
                    }
                }
            } catch (error) {
                console.error('An error occurred while retrieving token:', error);
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
