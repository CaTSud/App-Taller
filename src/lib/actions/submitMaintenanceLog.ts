'use server';

import { createClient } from '@/lib/supabase/server';
import { maintenanceLogSchema } from '@/lib/validations/maintenance';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, MaintenanceCategory } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

interface MaintenanceLogData {
    id?: string;
    plate: string;
    kmAtService: number;
    category: MaintenanceCategory;
    description: string;
    tirePosition?: string; // Comma separated
    newExpiryDate?: string;
    attachmentUrl?: string;
    interventionTypeName?: string;
}

/**
 * Submits a new maintenance log entry or updates an existing one
 * Handles photo upload and updates fleet_legal_status if needed
 */
export async function submitMaintenanceLog(
    data: MaintenanceLogData
): Promise<ActionResponse<{ id: string }>> {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        // Validate base data (simplified validation for updates if needed, but schema should hold)
        const validation = maintenanceLogSchema.safeParse({
            plate: data.plate,
            kmAtService: data.kmAtService,
            category: data.category,
            description: data.description,
            interventionTypeName: data.interventionTypeName,
        });

        if (!validation.success) {
            const errorMessages = validation.error.issues.map((issue) => issue.message).join(', ');
            return {
                success: false,
                error: errorMessages
            };
        }

        // --- SMART LIST LOGIC ---
        let interventionTypeId: number | null = null;
        if (data.interventionTypeName) {
            const { data: existingType } = await supabase
                .from('intervention_types')
                .select('id')
                .eq('category', data.category)
                .ilike('name', data.interventionTypeName)
                .single();

            if (existingType) {
                interventionTypeId = existingType.id;
            } else {
                const { data: newType, error: createError } = await supabase
                    .from('intervention_types')
                    .insert({
                        category: data.category,
                        name: data.interventionTypeName,
                        is_default: false,
                    })
                    .select('id')
                    .single();

                if (createError) {
                    if (createError.code === '23505') {
                        const { data: retryType } = await supabase
                            .from('intervention_types')
                            .select('id')
                            .eq('category', data.category)
                            .ilike('name', data.interventionTypeName)
                            .single();
                        interventionTypeId = retryType?.id || null;
                    }
                } else {
                    interventionTypeId = newType.id;
                }
            }
        }

        // Insert or Update maintenance log
        const logPayload = {
            plate: data.plate,
            user_id: user.id,
            km_at_service: data.kmAtService,
            category: data.category,
            description: data.description,
            attachment_url: data.attachmentUrl || null,
            tire_position: data.tirePosition || null,
            intervention_type_id: interventionTypeId,
        };

        let resultLog;
        if (data.id) {
            // UPDATE mode
            const { data: updatedLog, error: updateError } = await supabase
                .from('maintenance_logs')
                .update(logPayload)
                .eq('id', data.id)
                .select('id')
                .single();

            if (updateError) {
                console.error('Error updating maintenance log:', updateError);
                return { success: false, error: 'Error al actualizar el registro' };
            }
            resultLog = updatedLog;
        } else {
            // INSERT mode
            const { data: insertedLog, error: insertError } = await supabase
                .from('maintenance_logs')
                .insert(logPayload)
                .select('id')
                .single();

            if (insertError) {
                console.error('Error inserting maintenance log:', insertError);
                return { success: false, error: 'Error al guardar el registro' };
            }
            resultLog = insertedLog;
        }

        // If LEGAL or FRIGO category with new expiry date, update fleet_legal_status
        if ((data.category === 'LEGAL' || data.category === 'FRIGO') && data.newExpiryDate) {
            const legalUpdate = await updateLegalStatus(
                supabase,
                data.plate,
                data.description,
                data.interventionTypeName || '',
                data.newExpiryDate
            );

            if (!legalUpdate.success) {
                // We don't return early but we should probably inform or handle it
                console.error('Legal status update failed:', legalUpdate.error);
                return {
                    success: false,
                    error: `Registro guardado, pero falló la actualización del calendario: ${legalUpdate.error}`
                };
            }
        }

        // Logic for Oil Change (v3.5) - Enhanced Detection
        const searchPool = `${data.description} ${data.interventionTypeName || ''}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const isOilRelated = data.category === 'MECANICA' &&
            (searchPool.includes('aceite') || searchPool.includes('aceit') || searchPool.includes('oil'));

        if (isOilRelated) {
            const nextOilKm = data.kmAtService + 40000;
            const { error: oilError } = await supabase
                .from('fleet_legal_status')
                .upsert(
                    { plate: data.plate, next_oil_change_km: nextOilKm },
                    { onConflict: 'plate' }
                );

            if (oilError) {
                console.error('DATABASE ERROR:', oilError);
                return {
                    success: false,
                    error: `Registro guardado, pero falló el semáforo: ${oilError.message}. ¿Ejecutaste el comando SQL?`
                };
            }
        }

        revalidatePath('/');

        return {
            success: true,
            data: { id: resultLog.id }
        };
    } catch (error) {
        console.error('Unexpected error in submitMaintenanceLog:', error);
        return { success: false, error: 'Error inesperado' };
    }
}

/**
 * Updates fleet_legal_status based on favorable inspection result
 */
async function updateLegalStatus(
    supabase: SupabaseClient,
    plate: string,
    description: string,
    interventionType: string,
    newExpiryDate: string
): Promise<{ success: boolean; error?: string }> {
    // Determine which field to update based on description OR intervention type
    const searchString = `${description} ${interventionType}`.toLowerCase();

    let updateField: string | null = null;

    if (searchString.includes('itv')) {
        updateField = 'next_itv_date';
    } else if (searchString.includes('tacógrafo') || searchString.includes('tacografo') || searchString.includes('tacho')) {
        updateField = 'next_tacho_date';
    } else if (searchString.includes('atp') || searchString.includes('frigo')) {
        updateField = 'next_atp_date';
    }

    if (!updateField) {
        return { success: true }; // Nothing to update
    }

    // Upsert the fleet_legal_status record
    const { error } = await supabase
        .from('fleet_legal_status')
        .upsert(
            {
                plate,
                [updateField]: newExpiryDate,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'plate' }
        );

    if (error) {
        console.error('Error updating fleet_legal_status:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Uploads attachment photo to Supabase Storage
 */
export async function uploadAttachment(
    file: File,
    plate: string
): Promise<ActionResponse<{ url: string }>> {
    try {
        const supabase = await createClient();

        // Generate unique filename
        const timestamp = Date.now();
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${plate}/${timestamp}.${ext}`;

        // Upload to storage bucket
        const { data, error } = await supabase.storage
            .from('ALBARANS')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading attachment:', error);
            return { success: false, error: 'Error al subir la imagen' };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('ALBARANS')
            .getPublicUrl(data.path);

        return {
            success: true,
            data: { url: urlData.publicUrl }
        };
    } catch (error) {
        console.error('Unexpected error uploading attachment:', error);
        return { success: false, error: 'Error inesperado al subir' };
    }
}
