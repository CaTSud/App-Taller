'use client';

import { useMemo, useState, useEffect } from 'react';
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
        if (healthScore >= 80) return 'text-status-ok';
        if (healthScore >= 50) return 'text-status-warning';
        return 'text-status-error';
    }, [healthScore]);

    // Animation trigger
    const [isAnimated, setIsAnimated] = useState(false);
    useEffect(() => {
        setIsAnimated(true);
    }, []);

    const currentOffset = isAnimated ? offset : circumference;

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
                    className="text-slate-900"
                />
                {/* Progress Circle with draw-in animation */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={currentOffset}
                    strokeLinecap="round"
                    className={cn(
                        "transition-all duration-1500 ease-in-out", 
                        color,
                        !isAnimated && "opacity-0"
                    )}
                />
            </svg>

            <div className={cn(
                "flex flex-col items-center justify-center text-center z-10 p-4 transition-all duration-700",
                isAnimated ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}>
                <span className={cn("text-4xl font-bold tracking-tighter mb-1", color)}>
                    {Math.round(healthScore)}%
                </span>
                <span className="text-[11px] uppercase font-bold tracking-widest text-slate-500">
                    Health Index
                </span>
            </div>

            {/* Breathing inner glow */}
            <div className={cn(
                "absolute inset-[15%] rounded-full opacity-20 blur-3xl transition-all duration-1000 animate-pulse",
                healthScore >= 80 ? "bg-status-ok" : healthScore >= 50 ? "bg-status-warning" : "bg-status-error"
            )} />
        </div>
    );
}
