'use client';

import { useState, useEffect } from 'react';
import { StatusCard, TrafficLightGrid } from './StatusCard';
import { VehicleSelector } from './VehicleSelector';
import { ActionDrawer } from '@/components/maintenance/ActionDrawer';
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm';
import { getVehicleStatus, getAvailablePlates } from '@/lib/actions';
import type { VehicleStatus, MaintenanceCategory, PlateOption } from '@/types/database';
import { toast } from 'sonner';

export default function VehicleDashboard() {
    const [selectedPlate, setSelectedPlate] = useState<string>('');
    const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus | null>(null);
    const [plates, setPlates] = useState<PlateOption[]>([]);
    const [loading, setLoading] = useState(false);

    // Maintenance Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | null>(null);

    // Fetch available plates on mount
    useEffect(() => {
        getAvailablePlates().then(setPlates).catch(err => {
            console.error('Error fetching plates:', err);
        });
    }, []);

    // Fetch status when plate changes
    useEffect(() => {
        if (!selectedPlate) {
            setVehicleStatus(null);
            return;
        }

        async function fetchStatus() {
            setLoading(true);
            try {
                const status = await getVehicleStatus(selectedPlate);
                setVehicleStatus(status);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar estado del vehículo');
            } finally {
                setLoading(false);
            }
        }

        fetchStatus();
    }, [selectedPlate]);

    const handleCategorySelect = (category: MaintenanceCategory) => {
        if (!selectedPlate) {
            toast.error('Selecciona un vehículo primero');
            return;
        }
        setSelectedCategory(category);
        setIsDrawerOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 space-y-6">
            {/* Header */}
            <header className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            App Taller
                        </h1>
                        <p className="text-sm text-slate-400">Gestión de Mantenimiento</p>
                    </div>
                </div>

                <VehicleSelector
                    plates={plates}
                    selectedPlate={selectedPlate}
                    onSelect={setSelectedPlate}
                    loading={loading && !vehicleStatus}
                />
            </header>

            {/* Main Status */}
            <section>
                <StatusCard
                    vehicleStatus={vehicleStatus}
                    loading={loading}
                />
            </section>



            {/* Traffic Lights (Legal Status) */}
            {vehicleStatus && (
                <section>
                    <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                        Estado Legal
                    </h2>
                    <TrafficLightGrid vehicleStatus={vehicleStatus} />
                </section>
            )}

            {/* Action Drawer (FAB) */}
            <ActionDrawer
                onSelectCategory={handleCategorySelect}
                disabled={!selectedPlate}
            />

            {/* Maintenance Form */}
            {selectedPlate && vehicleStatus && (
                <MaintenanceForm
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    category={selectedCategory}
                    plate={selectedPlate}
                    currentKm={vehicleStatus.currentKm}
                />
            )}
        </div>
    );
}
