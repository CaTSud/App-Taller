-- =============================================
-- APP TALLER - NOTIFICATIONS SCHEMA
-- =============================================

-- 1. Table to store user FCM tokens
CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type VARCHAR(50), -- 'android', 'ios', 'web'
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- 2. Table to log sent notifications and prevent duplicates
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate VARCHAR(20) REFERENCES fleet_legal_status(plate),
  alert_type VARCHAR(50), -- 'ITV', 'TACHO', 'ATP', 'OIL'
  expiry_date DATE, -- The specific expiry date that triggered this alert
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies

-- Enable RLS
ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- user_fcm_tokens policies
DROP POLICY IF EXISTS "Users can insert their own tokens" ON user_fcm_tokens;
CREATE POLICY "Users can insert their own tokens" ON user_fcm_tokens
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own tokens" ON user_fcm_tokens;
CREATE POLICY "Users can view their own tokens" ON user_fcm_tokens
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tokens" ON user_fcm_tokens;
CREATE POLICY "Users can update their own tokens" ON user_fcm_tokens
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- notification_logs policies
-- (Assuming only backend/service role writes here mostly, but users might need read access if we show a history UI later)
DROP POLICY IF EXISTS "Authenticated users can read notification logs" ON notification_logs;
CREATE POLICY "Authenticated users can read notification logs" ON notification_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_plate ON notification_logs(plate);
CREATE INDEX IF NOT EXISTS idx_notification_logs_alert_check ON notification_logs(plate, alert_type, expiry_date);
