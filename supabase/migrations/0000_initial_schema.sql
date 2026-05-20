-- Create Videos Table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  duration INTEGER NOT NULL, -- duration in seconds
  thumbnail_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Analyses Table
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  chapters JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  transcript JSONB DEFAULT '[]'::jsonb,
  status analysis_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_analyses_video_id ON analyses(video_id);

-- Setup Row Level Security (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read access to all for MVP)
CREATE POLICY "Allow public read access to videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to analyses"
  ON analyses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to videos"
  ON videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert to analyses"
  ON analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to analyses"
  ON analyses FOR UPDATE
  USING (true)
  WITH CHECK (true);
