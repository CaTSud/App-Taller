'use server';

import { createClient } from '@/lib/supabase/server';
import type { InterventionType, MaintenanceCategory } from '@/types/database';

/**
 * Fetches intervention types for a specific category
 */
export async function getInterventionTypes(category: MaintenanceCategory): Promise<InterventionType[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('intervention_types')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching intervention types:', error);
        return [];
    }

    let results = data as InterventionType[];

    // USER REQUEST: Rename "Legal/ITV" to "ITV/Taco" and borra dentro del tipo de intervención la de "Seguro" y "ATP"
    if (category === 'LEGAL') {
        results = results.filter(t => !['seguro', 'atp'].includes(t.name.toLowerCase()));
    }

    // USER REQUEST: En Tipo de intervención que aparezca ATP
    if (category === 'FRIGO') {
        if (!results.some(t => t.name.toUpperCase() === 'ATP')) {
            results.push({ id: -1, category: 'FRIGO', name: 'ATP', is_default: false });
        }
    }

    return results;
}

