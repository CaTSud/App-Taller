-- =============================================
-- SCRIPT PARA CONFIGURAR intervention_types
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Permitir lectura pública (para que la app pueda leer los tipos)
CREATE POLICY "Allow public read" ON intervention_types
FOR SELECT USING (true);

-- 2. Permitir inserción desde usuarios autenticados o anónimos
CREATE POLICY "Allow public insert" ON intervention_types
FOR INSERT WITH CHECK (true);

-- 3. Insertar tipos de intervención predefinidos
INSERT INTO intervention_types (category, name, is_default) VALUES
-- MECANICA
('MECANICA', 'Aceite y Filtros', true),
('MECANICA', 'Frenos', true),
('MECANICA', 'Embrague', true),
('MECANICA', 'Batería', true),
('MECANICA', 'Escape', true),
('MECANICA', 'Suspensión', true),
('MECANICA', 'Motor', true),
('MECANICA', 'Transmisión', true),
('MECANICA', 'Dirección', true),
('MECANICA', 'Refrigeración', true),
-- NEUMATICOS
('NEUMATICOS', 'Cambio de rueda', true),
('NEUMATICOS', 'Rotación', true),
('NEUMATICOS', 'Reparación pinchazo', true),
('NEUMATICOS', 'Equilibrado', true),
('NEUMATICOS', 'Alineación', true),
-- LEGAL
('LEGAL', 'ITV', true),
('LEGAL', 'Tacógrafo', true),
('LEGAL', 'CAP', true),
-- FRIGO
('FRIGO', 'Revisión ATP', true),
('FRIGO', 'Carga de gas', true),
('FRIGO', 'Compresor', true),
('FRIGO', 'Termostato', true),
-- ACCIDENTE
('ACCIDENTE', 'Chapa y pintura', true),
('ACCIDENTE', 'Cristales', true),
('ACCIDENTE', 'Parte de seguro', true),
('ACCIDENTE', 'Remolque', true)
ON CONFLICT DO NOTHING;

-- 4. Verificar que se insertaron correctamente
SELECT category, COUNT(*) as total FROM intervention_types GROUP BY category;
