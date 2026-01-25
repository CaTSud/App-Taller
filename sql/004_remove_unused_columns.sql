-- =============================================
-- APP TALLER - REMOVE UNUSED COLUMNS
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Remove 'cost' column from maintenance_logs
-- (Field was removed from the UI per user request)
ALTER TABLE maintenance_logs DROP COLUMN IF EXISTS cost;

-- 2. Remove 'tire_action' column from maintenance_logs
-- (Replaced by intervention_type_id - Smart List)
ALTER TABLE maintenance_logs DROP COLUMN IF EXISTS tire_action;

-- 3. Remove 'insurance_expiry' column from fleet_legal_status
-- (Semáforo de Seguro ya no se muestra en el Dashboard)
ALTER TABLE fleet_legal_status DROP COLUMN IF EXISTS insurance_expiry;

-- Done! The unused columns have been removed.
