'use client';

import { Cloud, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { OilCanIcon } from '@/components/icons/OilCanIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VehicleStatus, TrafficLightColor } from '@/types/database';
import { calculateDaysUntil, formatDateES } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface StatusCardProps {
    vehicleStatus: VehicleStatus | null;
    loading?: boolean;
}

export function StatusCard({ vehicleStatus, loading }: StatusCardProps) {
    if (loading) {
        return (
            <Card className="animate-pulse bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                    <div className="h-16 bg-slate-800 rounded" />
                </CardContent>
            </Card>
        );
    }

    if (!vehicleStatus) {
        return (
            <Card className="border-dashed border-2 border-slate-700 bg-slate-900/50">
                <CardContent className="p-6 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>Selecciona un vehículo para ver su estado</p>
                </CardContent>
            </Card>
        );
    }

    const lastUpdate = new Date(vehicleStatus.lastKmUpdate);
    const formattedDate = lastUpdate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-3xl font-bold tracking-wider text-slate-100">
                        {vehicleStatus.plate}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                        <Cloud className="w-4 h-4" />
                        <span>Sincronizado</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white tabular-nums">
                        {vehicleStatus.currentKm.toLocaleString('es-ES')}
                    </span>
                    <span className="text-lg text-slate-400">km</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Última sincronización: {formattedDate}
                </p>
            </CardContent>
        </Card>
    );
}

// Traffic Light Grid Component
interface TrafficLightGridProps {
    vehicleStatus: VehicleStatus | null;
}

function getTrafficLight(value: string | number | null, isKm: boolean = false, currentKm?: number): TrafficLightColor {
    if (value === null || value === undefined) return 'yellow';

    if (isKm && typeof value === 'number' && currentKm !== undefined) {
        const remaining = value - currentKm;
        if (remaining <= 0) return 'red';
        if (remaining <= 5000) return 'yellow';
        return 'green';
    } else if (!isKm && typeof value === 'string') {
        const days = calculateDaysUntil(value);
        if (days === null) return 'yellow';
        if (days < 0) return 'red';
        if (days <= 30) return 'yellow';
        return 'green';
    }

    return 'yellow';
}

interface TrafficLightCardProps {
    label: string;
    value: string | number | null;
    isKm?: boolean;
    currentKm?: number;
    icon: React.ReactNode;
}

function TrafficLightCard({ label, value, isKm = false, currentKm, icon }: TrafficLightCardProps) {
    const color = getTrafficLight(value, isKm, currentKm);

    const colorStyles = {
        green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        yellow: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        red: 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse',
    };

    const iconBg = {
        green: 'bg-emerald-500/20',
        yellow: 'bg-amber-500/20',
        red: 'bg-red-500/20',
    };

    // Use the imported formatDateES function instead of local Date parsing

    return (
        <Card className={cn('border transition-all duration-300 backdrop-blur-md rounded-2xl overflow-hidden', colorStyles[color])}>
            <CardContent className="p-4 flex flex-col items-center">
                <div className={cn('p-3 rounded-full mb-3', iconBg[color])}>
                    {icon}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</p>
                {value !== null && value !== undefined ? (
                    <div className="mt-2 text-center">
                        <p className="text-sm font-bold text-white tracking-tight">
                            {isKm ? `${(value as number).toLocaleString('es-ES')} KM` : formatDateES(value as string)}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-80 text-slate-300">
                            {isKm && currentKm !== undefined ? (
                                (value as number) - currentKm <= 0
                                    ? 'AGOTADO'
                                    : `${((value as number) - currentKm).toLocaleString('es-ES')} KM faltan`
                            ) : (
                                !isKm && calculateDaysUntil(value as string) !== null ? (
                                    (calculateDaysUntil(value as string) || 0) < 0
                                        ? `Hace ${Math.abs(calculateDaysUntil(value as string) || 0)}d`
                                        : `${calculateDaysUntil(value as string)}d restantes`
                                ) : '---'
                            )}
                        </p>
                    </div>
                ) : (
                    <p className="text-[9px] font-bold uppercase tracking-wider mt-2 opacity-40 text-slate-400 italic">SIN REGISTRO</p>
                )}
            </CardContent>
        </Card>
    );
}

export function TrafficLightGrid({ vehicleStatus }: TrafficLightGridProps) {
    const legalStatus = vehicleStatus?.legalStatus;
    const currentKm = vehicleStatus?.currentKm || 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <TrafficLightCard
                label="ITV"
                value={legalStatus?.next_itv_date || null}
                icon={<CheckCircle2 className="w-8 h-8" />}
            />
            <TrafficLightCard
                label="Tacógrafo"
                value={legalStatus?.next_tacho_date || null}
                icon={<Clock className="w-8 h-8" />}
            />
            <TrafficLightCard
                label="ATP"
                value={legalStatus?.next_atp_date || null}
                icon={<AlertCircle className="w-8 h-8" />}
            />
            <TrafficLightCard
                label="Aceite"
                value={legalStatus?.next_oil_change_km || null}
                isKm={true}
                currentKm={currentKm}
                icon={<OilCanIcon className="w-8 h-8" />}
            />
        </div>
    );
}
