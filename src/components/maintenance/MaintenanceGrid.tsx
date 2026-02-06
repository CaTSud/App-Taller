'use client';

import { Wrench, Scale, Snowflake, Droplets } from 'lucide-react';
import { WheelIcon } from '@/components/icons/WheelIcon';
import { cn } from '@/lib/utils';
import type { MaintenanceCategory } from '@/types/database';

interface MaintenanceGridProps {
    onSelectCategory: (category: MaintenanceCategory) => void;
}

const categories: {
    id: MaintenanceCategory;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    glowColor: string;
}[] = [
        {
            id: 'MECANICA',
            label: 'Mecánica',
            description: 'Averías y filtros',
            icon: <Wrench className="w-8 h-8" />,
            color: 'from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 text-blue-400',
            borderColor: 'border-blue-500/20 hover:border-blue-500/50',
            glowColor: 'group-hover:bg-blue-500/20'
        },
        {
            id: 'NEUMATICOS',
            label: 'Neumáticos',
            description: 'Ruedas y llantas',
            icon: <WheelIcon className="w-8 h-8" />,
            color: 'from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20 text-orange-400',
            borderColor: 'border-orange-500/20 hover:border-orange-500/50',
            glowColor: 'group-hover:bg-orange-500/20'
        },
        {
            id: 'LEGAL',
            label: 'ITV/Taco',
            description: 'Estado legal',
            icon: <Scale className="w-8 h-8" />,
            color: 'from-emerald-500/10 to-emerald-600/10 hover:from-emerald-500/20 hover:to-emerald-600/20 text-emerald-400',
            borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
            glowColor: 'group-hover:bg-emerald-500/20'
        },
        {
            id: 'FRIGO',
            label: 'FRIGO',
            description: 'Equipo de frío',
            icon: <Snowflake className="w-8 h-8" />,
            color: 'from-cyan-500/10 to-cyan-600/10 hover:from-cyan-500/20 hover:to-cyan-600/20 text-cyan-400',
            borderColor: 'border-cyan-500/20 hover:border-cyan-500/50',
            glowColor: 'group-hover:bg-cyan-500/20'
        },
        {
            id: 'LAVADO_ENGRASE',
            label: 'Lavado y Engrase',
            description: 'Limpieza y lubricación',
            icon: <Droplets className="w-8 h-8" />,
            color: 'from-indigo-500/10 to-indigo-600/10 hover:from-indigo-500/20 hover:to-indigo-600/20 text-indigo-400',
            borderColor: 'border-indigo-500/20 hover:border-indigo-500/50',
            glowColor: 'group-hover:bg-indigo-500/20'
        }
    ];

export function MaintenanceGrid({ onSelectCategory }: MaintenanceGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4 auto-rows-fr">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={cn(
                        "group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300",
                        "flex flex-col items-center justify-center gap-3",
                        "bg-gradient-to-br",
                        cat.color,
                        cat.borderColor,
                        "hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                    )}
                >
                    {/* Background Glow */}
                    <div className={cn(
                        "absolute -inset-10 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500",
                        cat.glowColor
                    )} />

                    <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                        {cat.icon}
                    </div>

                    <div className="relative z-10 text-center text-white">
                        <span className="block font-bold text-lg tracking-tight">
                            {cat.label}
                        </span>
                        <span className="block text-[10px] opacity-60 uppercase font-bold tracking-widest mt-1">
                            {cat.description}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}
