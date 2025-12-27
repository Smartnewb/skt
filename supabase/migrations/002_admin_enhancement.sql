-- Admin Enhancement Migration
-- Add consultation_logs table and extend applications

-- 1. Extend status options and add new columns to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS risk_flag BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS assigned_admin TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 2. Create consultation_logs table for timeline memos
CREATE TABLE IF NOT EXISTS consultation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  admin_id TEXT NOT NULL,
  admin_name TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  callback_time TIMESTAMP WITH TIME ZONE,
  log_type TEXT DEFAULT 'memo', -- memo, status_change, callback, system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_app_id ON consultation_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_logs_callback ON consultation_logs(callback_time) WHERE callback_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_created ON consultation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_risk ON applications(risk_flag) WHERE risk_flag = true;

-- 4. Enable RLS on consultation_logs
ALTER TABLE consultation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on consultation_logs" ON consultation_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Status history tracking (optional but useful)
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_app ON status_history(app_id);

ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on status_history" ON status_history
  FOR ALL
  USING (true)
  WITH CHECK (true);
