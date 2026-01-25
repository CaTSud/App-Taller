'use server';

import { createClient } from '@/lib/supabase/server';
import type { MaintenanceCategory } from '@/types/database';

export interface MaintenanceLog {
  id: string;
  created_at: string;
  plate: string;
  km_at_service: number;
  category: MaintenanceCategory;
  description: string;
  attachment_url: string | null;
  tire_position: string | null;
  intervention_types?: {
    name: string;
  };
}

export async function getMaintenanceLogs(plate: string): Promise<MaintenanceLog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('maintenance_logs')
      .select(`
        *,
        intervention_types (
          name
        )
      `)
      .eq('plate', plate)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching maintenance logs:', error);
      return [];
    }

    return (data || []) as MaintenanceLog[];
  } catch (error) {
    console.error('Unexpected error fetching logs:', error);
    return [];
  }
}
