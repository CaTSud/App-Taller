'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Search, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { PlateOption } from '@/types/database';
import { cn } from '@/lib/utils';

interface VehicleSelectorProps {
    plates: PlateOption[];
    selectedPlate: string | null;
    onSelect: (plate: string) => void;
    loading?: boolean;
    variant?: 'default' | 'hero';
}

export function VehicleSelector({
    plates,
    selectedPlate,
    onSelect,
    loading,
    variant = 'default',
}: VehicleSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredPlates = useMemo(() => {
        if (!search) return plates;
        const searchLower = search.toLowerCase();
        return plates.filter((p) => p.plate.toLowerCase().includes(searchLower));
    }, [plates, search]);

    const selectedVehicle = plates.find((p) => p.plate === selectedPlate);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                        'w-full justify-between font-semibold transition-all duration-300',
                        variant === 'hero'
                            ? 'h-24 text-2xl px-6 rounded-3xl bg-slate-900 border-2 border-slate-700 text-white hover:border-blue-500 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] shadow-2xl'
                            : 'h-14 text-lg bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-white',
                        loading && 'animate-pulse'
                    )}
                    disabled={loading}
                >
                    <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-slate-400" />
                        {selectedPlate ? (
                            <span className="tracking-wider">{selectedPlate}</span>
                        ) : (
                            <span className="text-slate-400">Seleccionar vehículo...</span>
                        )}
                    </div>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[calc(100vw-2rem)] max-w-md bg-slate-900 border-slate-700"
                align="start"
            >
                {/* Search Input */}
                <div className="p-2 border-b border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar matrícula..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-slate-800 border-slate-600"
                        />
                    </div>
                </div>

                {/* Plates List */}
                <div className="max-h-[300px] overflow-y-auto">
                    {filteredPlates.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            No se encontraron vehículos
                        </div>
                    ) : (
                        filteredPlates.map((vehicle) => (
                            <DropdownMenuItem
                                key={vehicle.plate}
                                onClick={() => {
                                    onSelect(vehicle.plate);
                                    setOpen(false);
                                    setSearch('');
                                }}
                                className={cn(
                                    'flex justify-between items-center p-3 cursor-pointer',
                                    'hover:bg-slate-800 focus:bg-slate-800',
                                    selectedPlate === vehicle.plate && 'bg-slate-800'
                                )}
                            >
                                <span className="font-semibold tracking-wider">
                                    {vehicle.plate}
                                </span>
                                <span className="text-sm text-slate-400">
                                    {vehicle.currentKm.toLocaleString('es-ES')} km
                                </span>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
