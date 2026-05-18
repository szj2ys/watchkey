-- Add error column to analyses table
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS error TEXT;
