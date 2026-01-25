'use client';

import { useState, useEffect, useCallback } from 'react';

import { StatusCard, TrafficLightGrid, VehicleSelector, VisualStatusRing } from '@/components/dashboard';
import { MaintenanceForm, MaintenanceGrid, MaintenanceHistorySheet } from '@/components/maintenance';
import { getAvailablePlates, getVehicleStatus, signOut, type MaintenanceLog } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { LogOut, CheckCircle2, History, ChevronRight } from 'lucide-react';

import type { PlateOption, VehicleStatus, MaintenanceCategory } from '@/types/database';

export default function DashboardPage() {
  // State
  const [plates, setPlates] = useState<PlateOption[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | null>(null);
  const [editData, setEditData] = useState<any>(null);

  // Handle category selection from grid
  const handleCategorySelect = (category: MaintenanceCategory) => {
    setEditData(null); // Reset edit mode
    setSelectedCategory(category);
    setFormOpen(true);
  };

  // Handle edit from history
  const handleEditLog = (log: MaintenanceLog) => {
    setEditData({
      id: log.id,
      description: log.description,
      interventionTypeName: log.intervention_types?.name || '',
      tirePositions: log.tire_position ? log.tire_position.split(',') : [],
    });
    setSelectedCategory(log.category);
    setHistoryOpen(false);
    setFormOpen(true);
  };

  // Fetch available plates on mount
  useEffect(() => {
    async function fetchPlates() {
      try {
        const data = await getAvailablePlates();
        setPlates(data);
        // Do not auto-select plate anymore as per user request for selection screen
      } catch (error) {
        console.error('Error fetching plates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlates();
  }, []);

  // Fetch vehicle status when plate changes
  const fetchVehicleStatus = useCallback(async (plate: string) => {
    setStatusLoading(true);
    try {
      const status = await getVehicleStatus(plate);
      setVehicleStatus(status);
    } catch (error) {
      console.error('Error fetching vehicle status:', error);
      setVehicleStatus(null);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPlate) {
      fetchVehicleStatus(selectedPlate);
    }
  }, [selectedPlate, fetchVehicleStatus]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // STEP 1: Selection View
  if (!selectedPlate) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-start p-6 bg-slate-950 overflow-hidden relative">
        {/* Abstract background blobs */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]" />

        <div className="w-full max-w-md space-y-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center pt-16">
          {/* Official Logo */}
          <div className="w-48 h-48 mb-2 drop-shadow-2xl">
            <img
              src="/images/logo.png"
              alt="Logo App Taller"
              className="w-full h-full object-contain rounded-3xl"
            />
          </div>

          <header className="text-center space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-white">
              Buenos días.
            </h1>
            <p className="text-sm font-bold text-blue-400 uppercase tracking-[0.3em] pl-1">
              App Taller
            </p>
          </header>

          <div className="w-full space-y-10 pt-10">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-200 leading-relaxed uppercase tracking-wider">
                ¿Qué vehículo <br /> conduces hoy?
              </h2>
            </div>

            <VehicleSelector
              plates={plates}
              selectedPlate={selectedPlate}
              onSelect={setSelectedPlate}
              variant="hero"
            />
          </div>

          <footer className="pt-16 flex justify-center w-full">
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 font-bold text-xs uppercase tracking-widest"
            >
              Cerrar sesión
            </Button>
          </footer>
        </div>
      </main>
    );
  }

  // STEP 2: Dashboard View
  return (
    <main className="min-h-screen bg-slate-950 p-4 pb-24 relative overflow-x-hidden animate-in fade-in duration-500">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedPlate(null);
              setVehicleStatus(null);
            }}
            className="text-slate-400 hover:text-white bg-slate-900/50 rounded-full w-10 h-10 border border-slate-800"
          >
            <LogOut className="w-5 h-5 opacity-50 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-white leading-none">
              {selectedPlate}
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">
              Dashboard Principal
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 font-bold text-xs uppercase tracking-widest flex items-center gap-2 pr-0"
        >
          Cerrar sesión
          <LogOut className="w-4 h-4" />
        </Button>
      </header>

      {/* Visual Health Section */}
      <section className="mb-10 flex flex-col items-center">
        <div className="relative">
          <VisualStatusRing vehicleStatus={vehicleStatus} size={240} strokeWidth={14} />
          {/* Status chip */}
          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-slate-900/80 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-md backdrop-blur-md">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            VIVO
          </div>
        </div>

        {/* Info Card */}
        <div className="w-full mt-8 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-sm backdrop-blur-sm">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Kilometraje Actual</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white tabular-nums">
                  {vehicleStatus?.currentKm?.toLocaleString('es-ES') || '---'}
                </span>
                <span className="text-lg font-bold text-slate-400">KM</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Sincronización</p>
              <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CONECTADO
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Grid (Main Navigation) */}
      <section className="mb-6">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4 px-2">
          Gestión de Mantenimientos
        </h3>
        <MaintenanceGrid onSelectCategory={handleCategorySelect} />
      </section>

      {/* History Access Button (v3.0) */}
      <section className="mb-10 px-2">
        <Button
          onClick={() => setHistoryOpen(true)}
          variant="outline"
          className="w-full h-16 rounded-2xl bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-blue-500/50 text-white flex items-center justify-between px-6 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <History className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block font-bold text-base tracking-tight leading-none">Historial de Registros</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Revisa o edita tus entradas</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400">
            <ChevronRight className="w-5 h-5" />
          </div>
        </Button>
      </section>

      {/* Traffic Light Grid (Secondary Detail) */}
      <section className="mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-200">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4 px-2">
          Detalle de Expiraciones
        </h3>
        <TrafficLightGrid vehicleStatus={vehicleStatus} />
      </section>

      {/* Maintenance Form */}
      <MaintenanceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        category={selectedCategory}
        plate={selectedPlate || ''}
        currentKm={vehicleStatus?.currentKm || 0}
        initialData={editData}
        onSuccess={() => selectedPlate && fetchVehicleStatus(selectedPlate)}
      />

      {/* Maintenance History */}
      <MaintenanceHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        plate={selectedPlate || ''}
        onEdit={handleEditLog}
      />
    </main>
  );
}
