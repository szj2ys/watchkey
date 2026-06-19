-- Add progress tracking columns to analyses table
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS progress_stage TEXT DEFAULT NULL;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS progress_pct SMALLINT DEFAULT NULL;
