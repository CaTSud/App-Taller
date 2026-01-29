'use client';

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useFcmToken } from '@/hooks/useFcmToken';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationToggle() {
    const { permission, loading, requestPermission } = useFcmToken();

    if (permission === 'granted') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Bell className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Alertas Activas</span>
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                <BellOff className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Permiso Denegado</span>
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => requestPermission()}
            className={cn(
                "h-9 px-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all active:scale-95 shadow-md shadow-blue-500/20",
                loading && "opacity-70 pointer-events-none"
            )}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    <Bell className="w-4 h-4 mr-2" />
                    <span className="font-bold text-xs uppercase tracking-tight">Activar Alertas</span>
                </>
            )}
        </Button>
    );
}
