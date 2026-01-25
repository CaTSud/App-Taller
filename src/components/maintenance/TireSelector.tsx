'use client';

import { cn } from '@/lib/utils';
import type { TirePosition } from '@/types/database';

interface TireSelectorProps {
    selectedPositions: TirePosition[];
    onToggle: (position: TirePosition) => void;
    onSelectAxle: (positions: TirePosition[]) => void;
}

const tirePositions: { id: TirePosition; label: string; x: number; y: number }[] = [
    // Front Axle
    { id: 'front_left', label: 'Del. Izq.', x: 20, y: 25 },
    { id: 'front_right', label: 'Del. Der.', x: 80, y: 25 },
    // Rear Axle
    { id: 'rear_left_outer', label: 'Tras. Izq. Ext.', x: 10, y: 70 },
    { id: 'rear_left_inner', label: 'Tras. Izq. Int.', x: 25, y: 70 },
    { id: 'rear_right_inner', label: 'Tras. Der. Int.', x: 75, y: 70 },
    { id: 'rear_right_outer', label: 'Tras. Der. Ext.', x: 90, y: 70 },
];

export function TireSelector({ selectedPositions, onToggle, onSelectAxle }: TireSelectorProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Quick Select Buttons */}
            <div className="flex flex-col gap-2 mb-2">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => onSelectAxle(['front_left', 'front_right'])}
                            className="text-[10px] bg-slate-800 border border-slate-600 px-2 py-1 rounded hover:bg-slate-700 transition"
                        >
                            Eje Delantero
                        </button>
                        <button
                            type="button"
                            onClick={() => onSelectAxle(['rear_left_outer', 'rear_left_inner', 'rear_right_inner', 'rear_right_outer'])}
                            className="text-[10px] bg-slate-800 border border-slate-600 px-2 py-1 rounded hover:bg-slate-700 transition"
                        >
                            Eje Trasero
                        </button>
                    </div>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        DISEÑO PRO v2.1
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => onSelectAxle([...tirePositions.map(t => t.id)])}
                    className="text-xs bg-slate-800/50 border border-slate-700/50 w-full py-1.5 rounded hover:bg-slate-700 transition font-medium text-slate-300"
                >
                    Seleccionar Todas las Ruedas
                </button>
            </div>

            <div className="relative w-full max-w-xs mx-auto p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                {/* Truck chassis SVG - Redesigned for a "Premium Tech" look */}
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-auto drop-shadow-[0_0_15px_rgba(30,41,59,0.5)]"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="premiumChassisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
                        </linearGradient>
                        <linearGradient id="premiumHighlightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#334155', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#1e293b', stopOpacity: 0 }} />
                        </linearGradient>
                        <filter id="premiumGlow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Chassis body with double stroke and gradient */}
                    <rect
                        x="30"
                        y="10"
                        width="40"
                        height="82"
                        rx="6"
                        fill="url(#premiumChassisGradient)"
                        stroke="#334155"
                        strokeWidth="1.5"
                    />
                    <rect
                        x="32"
                        y="12"
                        width="36"
                        height="78"
                        rx="4"
                        fill="none"
                        stroke="url(#premiumHighlightGradient)"
                        strokeWidth="0.5"
                    />

                    {/* Cabin Details */}
                    <rect
                        x="33"
                        y="13"
                        width="34"
                        height="24"
                        rx="4"
                        className="fill-slate-800/80 stroke-slate-500/50"
                        strokeWidth="0.5"
                    />
                    {/* Windshield effect */}
                    <path
                        d="M36 15 H64 Q66 15 66 18 V28 Q66 31 64 31 H36 Q34 31 34 28 V18 Q34 15 36 15"
                        className="fill-slate-900/40"
                    />

                    {/* Mechanical detail lines */}
                    <line x1="35" y1="45" x2="65" y2="45" stroke="#334155" strokeWidth="0.5" />
                    <line x1="35" y1="55" x2="65" y2="55" stroke="#334155" strokeWidth="0.5" />
                    <line x1="35" y1="65" x2="65" y2="65" stroke="#334155" strokeWidth="0.5" />

                    {/* Tire positions */}
                    {tirePositions.map((tire) => {
                        const isSelected = selectedPositions.includes(tire.id);
                        return (
                            <g key={tire.id} className="cursor-pointer group" onClick={() => onToggle(tire.id)}>
                                {/* Tire Shadow/Glow */}
                                {isSelected && (
                                    <rect
                                        x={tire.x - 6}
                                        y={tire.y - 9}
                                        width="12"
                                        height="18"
                                        rx="3"
                                        className="fill-blue-500/20"
                                        filter="url(#premiumGlow)"
                                    />
                                )}

                                {/* Tire Body */}
                                <rect
                                    x={tire.x - 5}
                                    y={tire.y - 8}
                                    width="10"
                                    height="16"
                                    rx="2"
                                    className={cn(
                                        'transition-all duration-300',
                                        isSelected
                                            ? 'fill-blue-500 stroke-blue-300'
                                            : 'fill-slate-700 stroke-slate-500 group-hover:fill-slate-600 group-hover:stroke-slate-400'
                                    )}
                                    strokeWidth={isSelected ? "1.5" : "1"}
                                />

                                {/* Tread lines for more detail */}
                                <line x1={tire.x - 3} y1={tire.y - 4} x2={tire.x + 3} y2={tire.y - 4} stroke="currentColor" strokeWidth="0.5" className={cn(isSelected ? "text-blue-300/50" : "text-slate-600/50")} />
                                <line x1={tire.x - 3} y1={tire.y} x2={tire.x + 3} y2={tire.y} stroke="currentColor" strokeWidth="0.5" className={cn(isSelected ? "text-blue-300/50" : "text-slate-600/50")} />
                                <line x1={tire.x - 3} y1={tire.y + 4} x2={tire.x + 3} y2={tire.y + 4} stroke="currentColor" strokeWidth="0.5" className={cn(isSelected ? "text-blue-300/50" : "text-slate-600/50")} />

                                {isSelected && (
                                    <circle
                                        cx={tire.x}
                                        cy={tire.y}
                                        r="2.5"
                                        className="fill-white animate-pulse shadow-inner"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Selected Legend */}
            <div className="text-center min-h-[1.5rem]">
                {selectedPositions.length > 0 ? (
                    <p className="text-sm text-blue-400 font-medium">
                        {selectedPositions.length} ruedas seleccionadas
                    </p>
                ) : (
                    <p className="text-sm text-slate-400">
                        Toca las ruedas afectadas
                    </p>
                )}
            </div>
        </div >
    );
}
