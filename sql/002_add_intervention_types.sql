-- =============================================
-- APP TALLER - INTERVENTION TYPES (Smart List)
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create table for intervention types
CREATE TABLE IF NOT EXISTS intervention_types (
  id SERIAL PRIMARY KEY,
  category maintenance_category NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, name)
);

-- 2. Enable RLS
ALTER TABLE intervention_types ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Everyone can read intervention_types"
  ON intervention_types FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert (for Smart List auto-learning)
CREATE POLICY "Users can create intervention_types"
  ON intervention_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Add column to maintenance_logs
-- We store the ID of the intervention type
ALTER TABLE maintenance_logs 
ADD COLUMN IF NOT EXISTS intervention_type_id INT REFERENCES intervention_types(id);

-- 4. Seed Data
-- MECANICA
INSERT INTO intervention_types (category, name, is_default) VALUES
('MECANICA', 'Aceite y Filtros', true),
('MECANICA', 'Frenos', true),
('MECANICA', 'Embrague', true),
('MECANICA', 'Baterías', true),
('MECANICA', 'Luces', true),
('MECANICA', 'AdBlue', true)
ON CONFLICT (category, name) DO NOTHING;

-- NEUMATICOS
INSERT INTO intervention_types (category, name, is_default) VALUES
('NEUMATICOS', 'Cambio', true),
('NEUMATICOS', 'Pinchazo', true),
('NEUMATICOS', 'Rotación', true)
ON CONFLICT (category, name) DO NOTHING;

-- LEGAL
INSERT INTO intervention_types (category, name, is_default) VALUES
('LEGAL', 'ITV', true),
('LEGAL', 'Tacógrafo', true),
('LEGAL', 'ATP', true),
('LEGAL', 'Seguro', true)
ON CONFLICT (category, name) DO NOTHING;

-- FRIGO
INSERT INTO intervention_types (category, name, is_default) VALUES
('FRIGO', 'Revisión Motor', true),
('FRIGO', 'Termógrafo', true)
ON CONFLICT (category, name) DO NOTHING;
