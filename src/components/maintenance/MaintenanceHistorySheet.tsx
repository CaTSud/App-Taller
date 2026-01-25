'use client';

import { useState, useEffect } from 'react';
import { History, Calendar, ArrowLeft, Loader2, Wrench, CircleDot, Scale, Snowflake, AlertCircle, ChevronRight, Clock, FileText } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { getMaintenanceLogs, type MaintenanceLog } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface MaintenanceHistorySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plate: string;
    onEdit: (log: MaintenanceLog) => void;
}

const categoryIcons: Record<string, any> = {
    MECANICA: Wrench,
    NEUMATICOS: CircleDot,
    LEGAL: Scale,
    FRIGO: Snowflake,
    ACCIDENTE: AlertCircle,
};

const categoryColors: Record<string, string> = {
    MECANICA: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    NEUMATICOS: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    LEGAL: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    FRIGO: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    ACCIDENTE: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export function MaintenanceHistorySheet({ open, onOpenChange, plate, onEdit }: MaintenanceHistorySheetProps) {
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && plate) {
            setLoading(true);
            getMaintenanceLogs(plate).then(data => {
                setLogs(data);
                setLoading(false);
            });
        }
    }, [open, plate]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="h-[95vh] bg-slate-950 p-0 border-slate-800 rounded-t-[3rem] overflow-hidden flex flex-col"
            >
                <SheetTitle className="sr-only">Historial de Registros - {plate}</SheetTitle>
                <SheetDescription className="sr-only">Listado de los últimos registros de mantenimiento realizados para el vehículo {plate}</SheetDescription>

                {/* Header Hero */}
                <div className="pt-12 pb-6 px-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full pl-2 pr-4 h-9 font-bold backdrop-blur-md"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Atras
                        </Button>
                        <div className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full border border-white/10 text-white/40">
                            HISTORIAL
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl text-blue-400">
                            <History className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Historial de Registros</h2>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30">{plate}</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Cargando datos...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-20 px-8">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800 opacity-50">
                                <FileText className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-300">No hay registros</h3>
                            <p className="text-sm text-slate-500 mt-1">Todavía no has guardado ninguna intervención para este vehículo.</p>
                        </div>
                    ) : (
                        logs.map((log) => {
                            const Icon = categoryIcons[log.category] || History;
                            const date = new Date(log.created_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            });
                            const time = new Date(log.created_at).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={log.id}
                                    onClick={() => onEdit(log)}
                                    className="group relative bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 transition-all hover:bg-slate-900 hover:border-blue-500/30 active:scale-[0.98] cursor-pointer"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn("p-3 rounded-xl shrink-0 border", categoryColors[log.category])}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                                    {log.category}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                                                    <Clock className="w-3 h-3" />
                                                    {time}
                                                </div>
                                            </div>

                                            <h4 className="text-base font-bold text-white truncate pr-6">
                                                {log.intervention_types?.name || 'Registro General'}
                                            </h4>

                                            <div className="flex items-center gap-3 mt-2 text-xs font-bold">
                                                <div className="flex items-center gap-1 text-blue-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {date}
                                                </div>
                                                <div className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded italic">
                                                    {log.km_at_service.toLocaleString('es-ES')} KM
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-700">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
