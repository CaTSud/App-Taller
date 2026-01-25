'use server';

import { createClient } from '@/lib/supabase/server';
import type { VehicleStatus, PlateOption, FleetLegalStatus, DailyVehicleKm } from '@/types/database';

/**
 * Fetches unified vehicle status from both daily_vehicle_km and fleet_legal_status
 * Uses Promise.all for parallel queries
 */
export async function getVehicleStatus(plate: string): Promise<VehicleStatus | null> {
    const supabase = await createClient();

    const [kmResult, legalResult] = await Promise.all([
        // Query daily_vehicle_km (READ ONLY from App Ruta)
        supabase
            .from('daily_vehicle_km')
            .select('plate, current_km, last_update')
            .eq('plate', plate)
            .single(),

        // Query fleet_legal_status
        supabase
            .from('fleet_legal_status')
            .select('*')
            .eq('plate', plate)
            .single(),
    ]);

    if (kmResult.error || !kmResult.data) {
        console.error('Error fetching vehicle KM:', kmResult.error);
        return null;
    }

    const kmData = kmResult.data as DailyVehicleKm;
    const legalData = legalResult.data as FleetLegalStatus | null;

    return {
        plate: kmData.plate,
        currentKm: kmData.current_km,
        lastKmUpdate: kmData.last_update,
        legalStatus: legalData,
    };
}

/**
 * Fetches all available vehicle plates for the selector
 */
export async function getAvailablePlates(): Promise<PlateOption[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('daily_vehicle_km')
        .select('plate, current_km')
        .order('plate', { ascending: true });

    if (error) {
        console.error('Error fetching plates:', error);
        return [];
    }

    return (data || []).map((row) => ({
        plate: row.plate,
        currentKm: row.current_km,
    }));
}
