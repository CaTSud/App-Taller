'use client';

import { useEffect, useState, useCallback } from 'react';
import { getFirebaseMessaging } from '@/lib/firebase/config';
import { getToken } from 'firebase/messaging';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export const useFcmToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [loading, setLoading] = useState(false);

    const saveTokenToDatabase = async (token: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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

    const requestPermission = useCallback(async () => {
        setLoading(true);
        try {
            if (typeof window === 'undefined' || !('Notification' in window)) {
                toast.error('Las notificaciones no son compatibles con este navegador');
                return false;
            }

            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult === 'granted') {
                const messaging = await getFirebaseMessaging();
                if (!messaging) throw new Error('No se pudo inicializar Firebase Messaging');

                const currentToken = await getToken(messaging, {
                    vapidKey: 'BIy9dYR5mPVG4v0ZFP4fGASwUTnRX6yl_jPxFV6WTrsUZh3zSRqAeBMkjpV1dpbp4sd4HXEByfYS9O1e0XVGdqc'
                });

                if (currentToken) {
                    setToken(currentToken);
                    await saveTokenToDatabase(currentToken);
                    toast.success('Notificaciones activadas correctamente');
                    return true;
                }
            } else if (permissionResult === 'denied') {
                toast.error('Has denegado el permiso de notificaciones');
            }
        } catch (err) {
            console.error('Error requesting notification permission:', err);
            toast.error('Hubo un error al activar las notificaciones');
        } finally {
            setLoading(false);
        }
        return false;
    }, []);

    useEffect(() => {
        const checkStatus = async () => {
            if (typeof window !== 'undefined' && 'Notification' in window) {
                setPermission(Notification.permission);

                // If already granted, try to refresh token silently
                if (Notification.permission === 'granted') {
                    try {
                        const messaging = await getFirebaseMessaging();
                        if (messaging) {
                            const currentToken = await getToken(messaging, {
                                vapidKey: 'BIy9dYR5mPVG4v0ZFP4fGASwUTnRX6yl_jPxFV6WTrsUZh3zSRqAeBMkjpV1dpbp4sd4HXEByfYS9O1e0XVGdqc'
                            });
                            if (currentToken) {
                                setToken(currentToken);
                                await saveTokenToDatabase(currentToken);
                            }
                        }
                    } catch (e) {
                        console.warn('Silent token refresh failed', e);
                    }
                }
            }
        };

        checkStatus();
    }, []);

    return { token, permission, loading, requestPermission };
};
