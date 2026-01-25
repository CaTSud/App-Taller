-- =============================================
-- APP TALLER - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- ENUM for maintenance categories
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_category') THEN
    CREATE TYPE maintenance_category AS ENUM (
      'MECANICA',
      'NEUMATICOS', 
      'LEGAL',
      'FRIGO',
      'ACCIDENTE'
    );
  END IF;
END $$;

-- =============================================
-- TABLE: fleet_legal_status (Semáforo Legal)
-- Purpose: Store document expiration dates
-- Links to daily_vehicle_km via 'plate'
-- =============================================
CREATE TABLE IF NOT EXISTS fleet_legal_status (
  plate VARCHAR(20) PRIMARY KEY,
  next_itv_date DATE,
  next_tacho_date DATE,
  next_atp_date DATE,
  insurance_expiry DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fleet_legal_status ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read/write
DROP POLICY IF EXISTS "Authenticated users can manage fleet_legal_status" ON fleet_legal_status;
CREATE POLICY "Authenticated users can manage fleet_legal_status"
  ON fleet_legal_status
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- TABLE: maintenance_logs (Historial Clínico)
-- Purpose: Record each workshop entry
-- =============================================
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  km_at_service INT4 NOT NULL,
  category maintenance_category NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  cost NUMERIC(10,2),
  
  -- Tire-specific fields
  tire_position VARCHAR(20),  -- e.g., 'front_left', 'rear_right_outer'
  tire_action VARCHAR(20)     -- 'CAMBIO', 'ROTACION', 'PINCHAZO'
);

-- Enable RLS
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all logs
DROP POLICY IF EXISTS "Users can read maintenance_logs" ON maintenance_logs;
CREATE POLICY "Users can read maintenance_logs"
  ON maintenance_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own logs
DROP POLICY IF EXISTS "Users can insert maintenance_logs" ON maintenance_logs;
CREATE POLICY "Users can insert maintenance_logs"
  ON maintenance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries by plate
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_plate ON maintenance_logs(plate);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_created_at ON maintenance_logs(created_at DESC);

-- =============================================
-- FUNCTION: Update fleet_legal_status timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_fleet_legal_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_fleet_legal_status_timestamp ON fleet_legal_status;
CREATE TRIGGER trigger_update_fleet_legal_status_timestamp
  BEFORE UPDATE ON fleet_legal_status
  FOR EACH ROW
  EXECUTE FUNCTION update_fleet_legal_status_timestamp();

-- =============================================
-- STORAGE BUCKET: maintenance-attachments
-- For storing photos/receipts
-- =============================================
-- Note: Create this bucket in Supabase Dashboard > Storage
-- Name: maintenance-attachments
-- Public: false
-- Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
