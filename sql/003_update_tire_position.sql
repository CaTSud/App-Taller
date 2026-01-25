-- =============================================
-- APP TALLER - UPDATE TIRE POSITION COLUMN
-- Run this in Supabase SQL Editor
-- =============================================

-- Change tire_position from VARCHAR(20) to TEXT to support multiple comma-separated values
ALTER TABLE maintenance_logs 
ALTER COLUMN tire_position TYPE TEXT;
