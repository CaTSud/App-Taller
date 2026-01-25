'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { calculateDaysUntil } from '@/lib/utils/date';
import type { VehicleStatus } from '@/types/database';

interface VisualStatusRingProps {
    vehicleStatus: VehicleStatus | null;
    size?: number;
    strokeWidth?: number;
}

export function VisualStatusRing({
    vehicleStatus,
    size = 200,
    strokeWidth = 12
}: VisualStatusRingProps) {
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const healthScore = useMemo(() => {
        if (!vehicleStatus || !vehicleStatus.legalStatus) return 0;

        const legal = vehicleStatus.legalStatus;
        const dates = [
            legal.next_itv_date,
            legal.next_tacho_date,
            legal.next_atp_date,
            legal.insurance_expiry
        ];

        let totalScore = 0;
        let validDates = 0;

        dates.forEach(date => {
            if (date) {
                const days = calculateDaysUntil(date);
                if (days !== null) {
                    validDates++;
                    // Score logic: 30+ days = 1, 1-30 days = 0.5, <=0 days = 0
                    if (days > 30) totalScore += 1;
                    else if (days > 0) totalScore += 0.5;
                    else totalScore += 0;
                }
            }
        });

        if (validDates === 0) return 100; // Default to full health if no data
        return (totalScore / validDates) * 100;
    }, [vehicleStatus]);

    const offset = circumference - (healthScore / 100) * circumference;

    const color = useMemo(() => {
        if (healthScore >= 80) return 'text-emerald-500';
        if (healthScore >= 50) return 'text-amber-500';
        return 'text-red-500';
    }, [healthScore]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="absolute -rotate-90 w-full h-full transform transition-all duration-1000 ease-out">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-800"
                />
                {/* Progress Circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn("transition-all duration-1000 ease-out", color)}
                />
            </svg>

            <div className="flex flex-col items-center justify-center text-center z-10 p-4">
                <span className={cn("text-4xl font-bold tracking-tighter mb-1", color)}>
                    {Math.round(healthScore)}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Health Index
                </span>
            </div>

            {/* Subtle inner glow */}
            <div className={cn(
                "absolute inset-[15%] rounded-full opacity-20 blur-2xl transition-all duration-700",
                healthScore >= 80 ? "bg-emerald-500" : healthScore >= 50 ? "bg-amber-500" : "bg-red-500"
            )} />
        </div>
    );
}
