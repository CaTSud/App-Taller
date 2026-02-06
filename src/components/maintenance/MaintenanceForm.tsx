'use client';

import { useState, useEffect, useRef } from 'react';
import { Lock, Loader2, Calendar as CalendarIcon, X, Wrench, CircleDot, Scale, Snowflake, ClipboardList, Camera, AlertCircle, ChevronLeft, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetClose
} from '@/components/ui/sheet';

import { TireSelector } from './TireSelector';
import { PhotoUpload } from './PhotoUpload';

import { getVehicleStatus } from '@/lib/actions/getVehicleStatus'; // Not needed here but for reference
import { submitMaintenanceLog, uploadAttachment, getInterventionTypes, type MaintenanceLog } from '@/lib/actions';
import { maintenanceLogSchema } from '@/lib/validations/maintenance';
import type { MaintenanceCategory, TirePosition, TireAction } from '@/types/database';

interface MaintenanceFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: MaintenanceCategory | null;
    plate: string;
    currentKm: number;
    onSuccess?: () => void;
    initialData?: {
        id?: string;
        description: string;
        interventionTypeName: string;
        tirePositions?: string[];
        newExpiryDate?: string;
    };
    onOptimisticAction?: (log: Partial<MaintenanceLog>) => void;
}

// tireActions removed as redundant with interventionTypeName

const categoryLabels: Record<MaintenanceCategory, string> = {
    MECANICA: 'MECÁNICA',
    NEUMATICOS: 'RUEDAS',
    LEGAL: 'ITV / TACO',
    FRIGO: 'FRIGO',
    ACCIDENTE: 'ACCIDENTE',
    LAVADO_ENGRASE: 'LAVADO Y ENGRASE',
};

const categoryIcons: Record<MaintenanceCategory, React.ReactNode> = {
    MECANICA: <Wrench className="w-10 h-10" />,
    NEUMATICOS: <CircleDot className="w-10 h-10" />,
    LEGAL: <Scale className="w-10 h-10" />,
    FRIGO: <Snowflake className="w-10 h-10" />,
    ACCIDENTE: <AlertCircle className="w-10 h-10" />,
    LAVADO_ENGRASE: <Droplets className="w-10 h-10" />,
};

const categoryThemes: Record<MaintenanceCategory, string> = {
    MECANICA: 'from-blue-600/30 to-blue-950 text-blue-400 border-blue-500/30',
    NEUMATICOS: 'from-orange-600/30 to-orange-950 text-orange-400 border-orange-500/30',
    LEGAL: 'from-emerald-600/30 to-emerald-950 text-emerald-400 border-emerald-500/30',
    FRIGO: 'from-cyan-600/30 to-cyan-950 text-cyan-400 border-cyan-500/30',
    ACCIDENTE: 'from-red-600/30 to-red-950 text-red-400 border-red-500/30',
    LAVADO_ENGRASE: 'from-indigo-600/30 to-indigo-950 text-indigo-400 border-indigo-500/30',
};

export function MaintenanceForm({
    open,
    onOpenChange,
    category,
    plate,
    currentKm,
    onSuccess,
    initialData,
    onOptimisticAction,
}: MaintenanceFormProps) {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);

    // Smart List State
    const [interventionTypeName, setInterventionTypeName] = useState('');
    const [availableInterventionTypes, setAvailableInterventionTypes] = useState<{ id: number; name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter suggestions locally
    const filteredInterventionTypes = availableInterventionTypes.filter(type =>
        type.name.toLowerCase().includes(interventionTypeName.toLowerCase())
    );

    // Tire-specific state
    const [tirePositions, setTirePositions] = useState<TirePosition[]>([]);

    // Legal-specific state
    const [newExpiryDate, setNewExpiryDate] = useState('');

    // Real-time validation effect (Audit Point 4)
    useEffect(() => {
        if (!open) {
            setErrors({});
            return;
        }

        const validationResult = maintenanceLogSchema.safeParse({
            plate,
            kmAtService: currentKm,
            category,
            description,
            interventionTypeName,
        });

        if (!validationResult.success) {
            const newErrors: Record<string, string> = {};
            validationResult.error.issues.forEach((issue) => { // Zod infers this
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
        } else {
            setErrors({});
        }
    }, [description, interventionTypeName, category, plate, currentKm, open]);

    // Pre-populate if initialData is provided (Edit Mode)
    useEffect(() => {
        if (initialData && open) {
            setDescription(initialData.description || '');
            setInterventionTypeName(initialData.interventionTypeName || '');
            setTirePositions((initialData.tirePositions as TirePosition[]) || []);
            setNewExpiryDate(initialData.newExpiryDate || '');
        } else if (open && !initialData) {
            resetForm();
        }
    }, [initialData, open]);

    // Fetch intervention types when category changes
    useEffect(() => {
        if (!category) {
            setAvailableInterventionTypes([]);
            return;
        }

        getInterventionTypes(category).then(types => {
            setAvailableInterventionTypes(types);
        });

        if (!initialData) {
            setInterventionTypeName(''); // Reset selection only if NOT editing
        }
    }, [category, initialData]);

    const resetForm = () => {
        setDescription('');
        setPhoto(null);
        setTirePositions([]);
        setNewExpiryDate('');
        setInterventionTypeName('');
    };

    const handleTireToggle = (position: TirePosition) => {
        setTirePositions(prev => {
            if (prev.includes(position)) {
                return prev.filter(p => p !== position);
            }
            return [...prev, position];
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        // Validation
        if (!interventionTypeName.trim()) {
            toast.error('Debes introducir el tipo de intervención antes de guardar');
            return;
        }

        if (category === 'NEUMATICOS' && tirePositions.length === 0) {
            toast.error('Selecciona al menos un neumático');
            return;
        }

        setLoading(true);

        // Optimistic update (Point 3)
        if (onOptimisticAction) {
            onOptimisticAction({
                id: initialData?.id || 'temp-' + Date.now(),
                created_at: new Date().toISOString(),
                plate,
                km_at_service: currentKm,
                category,
                description,
                intervention_types: { name: interventionTypeName },
                attachment_url: initialData?.id ? undefined : (photo ? URL.createObjectURL(photo) : null)
            }); // Type inference or explicit type in props definition handles this better
        }

        try {
            // Upload photo first
            let attachmentUrl: string | undefined;
            if (photo) {
                const uploadResult = await uploadAttachment(photo, plate);
                if (!uploadResult.success) {
                    toast.error(uploadResult.error || 'Error al subir la imagen');
                    setLoading(false);
                    return;
                }
                attachmentUrl = uploadResult.data?.url;
            }

            // Submit maintenance log
            const result = await submitMaintenanceLog({
                id: initialData?.id,
                plate,
                kmAtService: currentKm,
                category,
                description,
                tirePosition: tirePositions.length > 0 ? tirePositions.join(',') : undefined,
                newExpiryDate: newExpiryDate || undefined,
                attachmentUrl,
                interventionTypeName,
            });

            if (result.success) {
                toast.success('Registro guardado correctamente');
                resetForm();
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    if (!category) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="h-[95vh] overflow-y-auto bg-slate-950 p-0 border-slate-800 rounded-t-[3rem] [&>button:last-child]:hidden"
            >
                {/* Accessibility labels (hidden) */}
                <SheetTitle className="sr-only">
                    Mantenimiento de {categoryLabels[category]} - {plate}
                </SheetTitle>
                <SheetDescription className="sr-only">
                    Formulario para registrar el mantenimiento de {categoryLabels[category]} del vehículo {plate}.
                </SheetDescription>

                {/* Hero Header Section */}
                <div className={cn(
                    "relative pt-16 pb-8 px-6 bg-gradient-to-b border-b",
                    categoryThemes[category]
                )}>
                    {/* Decorative background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-current opacity-20 blur-[100px] -translate-y-1/2" />

                    <div className="absolute top-6 left-6 z-20">
                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="bg-black/20 hover:bg-black/40 text-white border border-white/10 rounded-full pl-3 pr-5 h-12 font-bold backdrop-blur-md transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                Atrás
                            </Button>
                        </SheetClose>
                    </div>

                    <div className="flex flex-col items-center text-center gap-4 relative z-10">
                        <div className="p-5 rounded-[2rem] bg-slate-900 border-2 border-white/20 shadow-xl animate-in zoom-in-95 duration-500 flex items-center justify-center text-white">
                            {categoryIcons[category]}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
                                    {categoryLabels[category]}
                                </h2>
                                <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full border border-white/20 text-white backdrop-blur-md">
                                    v2.8
                                </span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                                Registro de Mantenimiento
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-w-lg mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8 pb-32">
                        {/* Section Card: Vehicle Info */}
                        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] shadow-sm backdrop-blur-sm space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <ClipboardList className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Datos Vehículo</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-slate-400 font-bold text-sm ml-1 uppercase tracking-wider">Matrícula</Label>
                                    <div className="bg-slate-800/80 border border-slate-700 h-14 rounded-2xl flex items-center px-4 shadow-inner">
                                        <span className="text-xl font-black text-white tracking-widest">{plate}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-slate-400 font-bold text-sm ml-1 uppercase tracking-wider flex items-center gap-1">
                                        Kilómetros
                                        <Lock className="w-3 h-3 text-slate-600" />
                                    </Label>
                                    <div className="bg-slate-800/50 border border-slate-700 h-14 rounded-2xl flex items-center px-4 shadow-inner opacity-60">
                                        <span className="text-xl font-black text-slate-400 tabular-nums">{currentKm.toLocaleString('es-ES')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Card: Intervention Details (higher z-index for dropdown) */}
                        <div className="relative z-20 bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] shadow-sm backdrop-blur-sm space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                    <Wrench className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Intervención</h3>
                            </div>

                            {/* Tire-specific UI inside the intervention card */}
                            {category === 'NEUMATICOS' && (
                                <div className="space-y-4 pt-2">
                                    <Label className="text-slate-400 font-bold text-sm ml-1 uppercase tracking-wider">Selector de Ruedas</Label>
                                    <div className="bg-black/20 p-2 rounded-3xl border border-white/5">
                                        <TireSelector
                                            selectedPositions={tirePositions}
                                            onToggle={handleTireToggle}
                                            onSelectAxle={setTirePositions}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <Label className="text-slate-400 font-bold text-sm ml-1 uppercase tracking-wider">Tipo de Intervención</Label>
                                <div className="relative" ref={dropdownRef}>
                                    <Input
                                        value={interventionTypeName}
                                        onChange={(e) => {
                                            setInterventionTypeName(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Buscar o crear..."
                                        className="h-16 bg-slate-800/80 border-slate-700 rounded-2xl text-lg font-bold placeholder:text-slate-600 focus:ring-blue-500/50 pr-12"
                                        autoCorrect="off"
                                    />
                                    {errors.interventionTypeName && (
                                        <p className="mt-2 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                                            {errors.interventionTypeName}
                                        </p>
                                    )}
                                    {interventionTypeName && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setInterventionTypeName('');
                                                setShowSuggestions(true);
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                    {showSuggestions && (
                                        <div className="absolute z-[100] w-full mt-2 bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 max-h-64 overflow-y-auto">
                                            {filteredInterventionTypes.length > 0 ? (
                                                filteredInterventionTypes.map((type) => (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        className="w-full text-left px-5 py-4 text-sm font-bold text-slate-300 hover:bg-blue-600 hover:text-white border-b border-slate-700 last:border-0 transition"
                                                        onClick={() => {
                                                            setInterventionTypeName(type.name);
                                                            setShowSuggestions(false);
                                                        }}
                                                    >
                                                        {type.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div
                                                    className="px-5 py-4 text-sm text-blue-400 font-black cursor-pointer hover:bg-blue-600 hover:text-white transition"
                                                    onClick={() => setShowSuggestions(false)}
                                                >
                                                    + CREAR &quot;{interventionTypeName}&quot;
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Legal/FRIGO Expiry inside intervention card */}
                            {(category === 'LEGAL' || category === 'FRIGO') && (
                                <div className="space-y-4">
                                    <Label className="text-slate-400 font-bold text-sm ml-1 uppercase tracking-wider flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" />
                                        {category === 'FRIGO' ? 'Próxima revisión' : 'Nueva fecha de caducidad'}
                                    </Label>
                                    <Input
                                        type="date"
                                        value={newExpiryDate}
                                        onChange={(e) => setNewExpiryDate(e.target.value)}
                                        className={cn(
                                            "h-14 bg-slate-800/80 border-slate-700 rounded-2xl text-lg font-bold",
                                            !newExpiryDate && (category === 'LEGAL' || category === 'FRIGO') && "border-amber-500/50"
                                        )}
                                    />
                                    {!newExpiryDate && (category === 'LEGAL' || category === 'FRIGO') && (
                                        <p className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                                            Recomendado para actualizar semáforo
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <Label className="text-slate-400 font-bold text-sm ml-1 uppercase tracking-wider">Notas Especiales</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Añade cualquier detalle relevante..."
                                    rows={3}
                                    className="bg-slate-800/80 border-slate-700 rounded-2xl p-4 text-base font-medium resize-none focus:ring-blue-500/50"
                                />
                            </div>
                        </div>

                        {/* Section Card: Photos (lower z-index) */}
                        <div className="relative z-10 bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] shadow-sm backdrop-blur-sm space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Documentación</h3>
                            </div>

                            <div className="space-y-2">
                                <PhotoUpload
                                    value={photo}
                                    onChange={setPhoto}
                                />
                                <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest mt-4">Toca para capturar albarán o factura</p>
                            </div>
                        </div>

                        {/* Massive Guardar Button */}
                        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-40">
                            <Button
                                type="submit"
                                size="lg"
                                className={cn(
                                    "w-full max-w-lg mx-auto h-20 text-xl font-black tracking-widest uppercase rounded-[2rem] shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-blue-600 hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-95 border-b-4 border-blue-800",
                                    Object.keys(errors).length > 0 && "opacity-80 grayscale-[20%] border-slate-700"
                                )}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                        {initialData ? 'ACTUALIZANDO...' : 'GUARDANDO...'}
                                    </>
                                ) : (
                                    initialData ? 'ACTUALIZAR REGISTRO' : 'GUARDAR REGISTRO'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
