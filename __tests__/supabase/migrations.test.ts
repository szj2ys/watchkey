import * as fs from 'fs';
import * as path from 'path';

describe('Supabase Migrations', () => {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  it('has migration files', () => {
    const files = fs.readdirSync(migrationsDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.endsWith('.sql'))).toBe(true);
  });
  
  it('has initial schema with videos and analyses tables', () => {
    const files = fs.readdirSync(migrationsDir).sort();
    const initialMigration = files[0];
    const content = fs.readFileSync(path.join(migrationsDir, initialMigration), 'utf8');
    
    expect(content).toContain('CREATE TABLE IF NOT EXISTS videos');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS analyses');
  });

  it('has RLS policies configured', () => {
    const files = fs.readdirSync(migrationsDir).sort();
    const initialMigration = files[0];
    const content = fs.readFileSync(path.join(migrationsDir, initialMigration), 'utf8');
    
    expect(content).toContain('ENABLE ROW LEVEL SECURITY');
    expect(content).toContain('CREATE POLICY');
  });

  it('has performance indexes', () => {
    const files = fs.readdirSync(migrationsDir).sort();
    const initialMigration = files[0];
    const content = fs.readFileSync(path.join(migrationsDir, initialMigration), 'utf8');
    
    expect(content).toContain('CREATE INDEX');
    expect(content).toContain('idx_videos_youtube_id');
    expect(content).toContain('idx_analyses_video_id');
  });
});
