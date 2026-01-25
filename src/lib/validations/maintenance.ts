import { z } from 'zod';

// Base maintenance log schema - simplified for Zod v4 compatibility
export const maintenanceLogSchema = z.object({
    plate: z.string().min(1, 'La matrícula es obligatoria'),
    kmAtService: z.number().int().positive('Los kilómetros deben ser positivos'),
    category: z.string().min(1, 'La categoría es obligatoria'),
    description: z.string().optional(),
    interventionTypeName: z.string().optional(),
});

// Fleet legal status update schema
export const fleetLegalStatusSchema = z.object({
    plate: z.string().min(1),
    next_itv_date: z.string().nullable(),
    next_tacho_date: z.string().nullable(),
    next_atp_date: z.string().nullable(),
});

// Infer types from schemas
export type MaintenanceLogInput = z.infer<typeof maintenanceLogSchema>;
export type FleetLegalStatusInput = z.infer<typeof fleetLegalStatusSchema>;
