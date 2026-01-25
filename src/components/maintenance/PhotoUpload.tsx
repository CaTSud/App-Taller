'use client';

import { useRef, useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
    value: File | null;
    onChange: (file: File | null) => void;
    required?: boolean;
}

export function PhotoUpload({ value, onChange, required }: PhotoUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        onChange(null);
        setPreview(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            {!value ? (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        'w-full h-32 rounded-xl border-2 border-dashed',
                        'flex flex-col items-center justify-center gap-2',
                        'transition-colors',
                        required
                            ? 'border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10'
                            : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800'
                    )}
                >
                    <Camera className={cn(
                        'w-10 h-10',
                        required ? 'text-amber-400' : 'text-slate-400'
                    )} />
                    <span className={cn(
                        'text-sm font-medium',
                        required ? 'text-amber-400' : 'text-slate-300'
                    )}>
                        {required ? 'Foto del Albarán (obligatoria)' : 'Añadir foto'}
                    </span>
                    <span className="text-xs text-slate-500">
                        Toca para capturar o subir
                    </span>
                </button>
            ) : (
                <div className="relative">
                    {preview ? (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-800">
                            <img
                                src={preview}
                                alt="Vista previa"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-32 rounded-xl bg-slate-800 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-slate-400" />
                            <span className="ml-2 text-slate-300">{value.name}</span>
                        </div>
                    )}

                    <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full"
                        onClick={handleRemove}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
