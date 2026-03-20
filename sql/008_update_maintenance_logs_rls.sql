-- =============================================
-- APP TALLER - REFINADO DE POLÍTICAS RLS (Mantenimiento Colaborativo)
-- Propósito: Permitir que todos los conductores vean el historial, 
-- pero que solo el autor pueda editar sus propios registros.
-- =============================================

-- 1. TABLA: maintenance_logs
-- Aseguramos que la política de lectura sea abierta para todos los conductores
DROP POLICY IF EXISTS "Users can read maintenance_logs" ON maintenance_logs;
CREATE POLICY "Everyone can read maintenance_logs"
  ON maintenance_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir INSERT solo con el propio UID (Ya existía, pero reforzamos)
DROP POLICY IF EXISTS "Users can insert maintenance_logs" ON maintenance_logs;
CREATE POLICY "Users can insert own maintenance_logs"
  ON maintenance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- NUEVA: Permitir UPDATE solo al autor del registro
DROP POLICY IF EXISTS "Users can update own maintenance_logs" ON maintenance_logs;
CREATE POLICY "Users can update own maintenance_logs"
  ON maintenance_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NUEVA: Permitir DELETE solo al autor del registro
DROP POLICY IF EXISTS "Users can delete own maintenance_logs" ON maintenance_logs;
CREATE POLICY "Users can delete own maintenance_logs"
  ON maintenance_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. TABLA: fleet_legal_status
-- Todos deben poder ver el estado legal para saber si el camión está listo
DROP POLICY IF EXISTS "Authenticated users can manage fleet_legal_status" ON fleet_legal_status;
CREATE POLICY "Everyone can read fleet_legal_status"
  ON fleet_legal_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Todos pueden actualizarlo (itv, tacho, aceite) para que cualquier conductor 
-- pueda realizar la tarea si fuera necesario.
CREATE POLICY "Anyone can update fleet_legal_status"
  ON fleet_legal_status
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
