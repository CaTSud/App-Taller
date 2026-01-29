-- =============================================
-- STORAGE BUCKET: ALBARANS
-- Purpose: Store maintenance delivery notes (albaranes)
-- =============================================

-- 1. Create the bucket 'ALBARANS' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ALBARANS', 'ALBARANS', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on the bucket (standard practice, though often enabled by default)
-- Note: Policies correspond to the 'storage.objects' table

-- 3. POLICY: Allow authenticated users to INSERT files
DROP POLICY IF EXISTS "Authenticated users can upload to ALBARANS" ON storage.objects;
CREATE POLICY "Authenticated users can upload to ALBARANS"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ALBARANS');

-- 4. POLICY: Allow authenticated users to SELECT (view) files
DROP POLICY IF EXISTS "Authenticated users can view ALBARANS" ON storage.objects;
CREATE POLICY "Authenticated users can view ALBARANS"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ALBARANS');

-- 5. POLICY: Allow authenticated users to UPDATE files (optional, but good for retries/overwrites if needed)
DROP POLICY IF EXISTS "Authenticated users can update ALBARANS" ON storage.objects;
CREATE POLICY "Authenticated users can update ALBARANS"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ALBARANS');

-- 6. POLICY: Allow authenticated users to DELETE files (optional)
DROP POLICY IF EXISTS "Authenticated users can delete ALBARANS" ON storage.objects;
CREATE POLICY "Authenticated users can delete ALBARANS"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ALBARANS');
