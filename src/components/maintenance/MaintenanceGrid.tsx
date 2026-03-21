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
            color: 'from-mecanica/10 to-mecanica/20 hover:from-mecanica/20 hover:to-mecanica/30 text-mecanica',
            borderColor: 'border-mecanica/20 hover:border-mecanica/50',
            glowColor: 'group-hover:bg-mecanica/20'
        },
        {
            id: 'NEUMATICOS',
            label: 'Neumáticos',
            description: 'Ruedas y llantas',
            icon: <WheelIcon className="w-8 h-8" />,
            color: 'from-neumaticos/10 to-neumaticos/20 hover:from-neumaticos/20 hover:to-neumaticos/30 text-neumaticos',
            borderColor: 'border-neumaticos/20 hover:border-neumaticos/50',
            glowColor: 'group-hover:bg-neumaticos/20'
        },
        {
            id: 'LEGAL',
            label: 'ITV/Taco',
            description: 'Estado legal',
            icon: <Scale className="w-8 h-8" />,
            color: 'from-legal/10 to-legal/20 hover:from-legal/20 hover:to-legal/30 text-legal',
            borderColor: 'border-legal/20 hover:border-legal/50',
            glowColor: 'group-hover:bg-legal/20'
        },
        {
            id: 'FRIGO',
            label: 'FRIGO',
            description: 'Equipo de frío',
            icon: <Snowflake className="w-8 h-8" />,
            color: 'from-frigo/10 to-frigo/20 hover:from-frigo/20 hover:to-frigo/30 text-frigo',
            borderColor: 'border-frigo/20 hover:border-frigo/50',
            glowColor: 'group-hover:bg-frigo/20'
        },
        {
            id: 'LAVADO_ENGRASE',
            label: 'Lavado y Engrase',
            description: 'Limpieza y lubricación',
            icon: <Droplets className="w-8 h-8" />,
            color: 'from-lavado/10 to-lavado/20 hover:from-lavado/20 hover:to-lavado/30 text-lavado',
            borderColor: 'border-lavado/20 hover:border-lavado/50',
            glowColor: 'group-hover:bg-lavado/20'
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
                        "hover:-translate-y-1 active:scale-95",
                        cat.id === 'MECANICA' && 'hover:shadow-mecanica',
                        cat.id === 'NEUMATICOS' && 'hover:shadow-neumaticos',
                        cat.id === 'LEGAL' && 'hover:shadow-legal',
                        cat.id === 'FRIGO' && 'hover:shadow-frigo',
                        cat.id === 'LAVADO_ENGRASE' && 'hover:shadow-lavado'
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
                        <span className="block text-[11px] opacity-80 uppercase font-bold tracking-widest mt-1.5">
                            {cat.description}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}
