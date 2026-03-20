// =============================================
// APP TALLER - DATABASE TYPES
// TypeScript definitions for all tables
// =============================================

// Maintenance category enum
export type MaintenanceCategory =
  | 'MECANICA'
  | 'NEUMATICOS'
  | 'LEGAL'
  | 'FRIGO'
  | 'ACCIDENTE'
  | 'LAVADO_ENGRASE';

// Tire position options
export type TirePosition =
  | 'front_left'
  | 'front_right'
  | 'rear_left_inner'
  | 'rear_left_outer'
  | 'rear_right_inner'
  | 'rear_right_outer';

// Tire action options
export type TireAction =
  | 'CAMBIO'
  | 'ROTACION'
  | 'PINCHAZO';

// =============================================
// EXISTING TABLE (READ ONLY)
// =============================================

/**
 * daily_vehicle_km - Owned by App Ruta
 * READ ONLY - Do not modify this table's structure
 */
export interface DailyVehicleKm {
  id: string;           // UUID
  plate: string;        // Vehicle plate (link key)
  current_km: number;   // Current kilometer reading
  last_update: string;  // ISO timestamp
}

// =============================================
// NEW TABLES
// =============================================

/**
 * fleet_legal_status - Document expiration tracking
 * Linked to daily_vehicle_km via 'plate'
 */
export interface FleetLegalStatus {
  plate: string;              // Primary key, vehicle plate
  next_itv_date: string | null;      // Next ITV date (ISO date)
  next_tacho_date: string | null;    // Next tachograph date
  next_atp_date: string | null;      // Next ATP/frigo date
  next_oil_change_km: number | null; // Next oil change mileage
  updated_at: string;         // Last update timestamp
}


/**
 * intervention_types - Catalog of maintenance interventions
 */
export interface InterventionType {
  id: number;
  category: MaintenanceCategory;
  name: string;
  is_default: boolean;
}

/**
 * maintenance_logs - Workshop entry records
 */
export interface MaintenanceLog {
  id: string;                 // UUID
  plate: string;              // Vehicle plate
  user_id: string;            // Auth user ID
  created_at: string;         // ISO timestamp
  km_at_service: number;      // Km snapshot at service time
  category: MaintenanceCategory;
  intervention_type_id?: number; // Link to intervention type
  description: string;
  attachment_url: string | null;
  tire_position: string | null; // Comma-separated or JSON
}


// =============================================
// INSERT TYPES (for forms)
// =============================================

export type MaintenanceLogInsert = Omit<MaintenanceLog, 'id' | 'created_at'>;
export type FleetLegalStatusUpsert = FleetLegalStatus;

// =============================================
// UNIFIED STATUS (for Dashboard)
// =============================================

/**
 * Combined vehicle status from multiple tables
 * Used by getVehicleStatus() server action
 */
export interface VehicleStatus {
  plate: string;
  // From daily_vehicle_km
  currentKm: number;
  lastKmUpdate: string;
  // From fleet_legal_status
  legalStatus: FleetLegalStatus | null;
}

// =============================================
// TRAFFIC LIGHT STATUSES
// =============================================

export type TrafficLightColor = 'green' | 'yellow' | 'red';

export interface TrafficLightStatus {
  itv: TrafficLightColor;
  tacho: TrafficLightColor;
  atp: TrafficLightColor;
}

// =============================================
// FORM TYPES
// =============================================

export interface MaintenanceFormData {
  plate: string;
  kmAtService: number;
  category: MaintenanceCategory;
  description: string;
  attachment: File | null;
  // Tire-specific
  tirePosition?: TirePosition;
  // Legal-specific
  newExpiryDate?: string;
  // Smart List
  interventionTypeName?: string;
  interventionTypeId?: number;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================
// PLATE OPTIONS (for selector)
// =============================================

export interface PlateOption {
  plate: string;
  currentKm: number;
}
