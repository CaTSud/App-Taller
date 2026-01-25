'use client';

import { useFcmToken } from '@/hooks/useFcmToken';

export function FcmInitializer() {
    useFcmToken();
    return null;
}
