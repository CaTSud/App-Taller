'use client';

import { useState } from 'react';
import { Plus, Wrench, CircleDot, Scale, Snowflake, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { MaintenanceCategory } from '@/types/database';
import { cn } from '@/lib/utils';

interface ActionDrawerProps {
    onSelectCategory: (category: MaintenanceCategory) => void;
    disabled?: boolean;
}

const categoryOptions: {
    category: MaintenanceCategory;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}[] = [
        {
            category: 'MECANICA',
            label: 'Mecánica',
            description: 'Averías, aceites, filtros',
            icon: <Wrench className="w-8 h-8" />,
            color: 'bg-blue-500/20 border-blue-500 text-blue-400',
        },
        {
            category: 'NEUMATICOS',
            label: 'Neumáticos',
            description: 'Cambio, rotación, pinchazo',
            icon: <CircleDot className="w-8 h-8" />,
            color: 'bg-orange-500/20 border-orange-500 text-orange-400',
        },
        {
            category: 'LEGAL',
            label: 'ITV/Taco',
            description: 'Inspecciones técnicas',
            icon: <Scale className="w-8 h-8" />,
            color: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
        },
        {
            category: 'FRIGO',
            label: 'FRIGO',
            description: 'Mantenimiento ATP',
            icon: <Snowflake className="w-8 h-8" />,
            color: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
        },
        {
            category: 'LAVADO_ENGRASE',
            label: 'Lavado y Engrase',
            description: 'Limpieza y lubricación',
            icon: <Droplets className="w-8 h-8" />,
            color: 'bg-indigo-500/20 border-indigo-500 text-indigo-400',
        },
    ];

export function ActionDrawer({ onSelectCategory, disabled }: ActionDrawerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (category: MaintenanceCategory) => {
        setOpen(false);
        onSelectCategory(category);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    className={cn(
                        'fixed bottom-6 right-6 z-50',
                        'w-14 h-14 rounded-full shadow-lg',
                        'bg-primary hover:bg-primary/90',
                        'transition-transform active:scale-95'
                    )}
                    disabled={disabled}
                >
                    <Plus className="w-7 h-7" />
                    <span className="sr-only">Nuevo registro</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto bg-slate-900 border-slate-700">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl text-center text-slate-100">
                        ¿Qué tipo de registro?
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Selecciona el tipo de mantenimiento que deseas registrar.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid grid-cols-2 gap-4 pb-6">
                    {categoryOptions.map(({ category, label, description, icon, color }) => (
                        <button
                            key={category}
                            onClick={() => handleSelect(category)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-2 p-6',
                                'rounded-xl border-2 transition-all',
                                'active:scale-[0.98]',
                                color
                            )}
                        >
                            {icon}
                            <span className="font-semibold">{label}</span>
                            <span className="text-xs opacity-70 text-center">{description}</span>
                        </button>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
