'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineStatus() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        setIsOffline(!navigator.onLine);

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className={cn(
            "fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em]",
            "py-1 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300"
        )}>
            <WifiOff className="w-3 h-3" />
            Sin conexión - Usando datos locales
        </div>
    );
}
