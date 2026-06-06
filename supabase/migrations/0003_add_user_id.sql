-- Add user_id to videos and analyses for user-specific data
ALTER TABLE videos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  youtube_refresh_token TEXT,
  analysis_count INTEGER DEFAULT 0,
  analysis_limit INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies
DROP POLICY IF EXISTS "Allow public read access to videos" ON videos;
DROP POLICY IF EXISTS "Allow public read access to analyses" ON analyses;
DROP POLICY IF EXISTS "Allow public insert to videos" ON videos;
DROP POLICY IF EXISTS "Allow public insert to analyses" ON analyses;
DROP POLICY IF EXISTS "Allow public update to analyses" ON analyses;

-- Videos: anyone can read, anyone can insert (anonymous or authenticated)
CREATE POLICY "Anyone can read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert videos" ON videos FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can update own videos" ON videos FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);

-- Analyses: anyone can read, anyone can insert (anonymous or authenticated)
CREATE POLICY "Anyone can read analyses" ON analyses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analyses" ON analyses FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Anyone can update analyses" ON analyses FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);
