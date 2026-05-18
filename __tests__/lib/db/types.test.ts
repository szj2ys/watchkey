import type { Database } from '../../../types/database.types';

describe('Database Types', () => {
  it('should have the correct schema structure', () => {
    // This is a type-only test to verify that the generated types match our schema
    // If the types are missing or incorrect, this file will fail to compile
    type Tables = Database['public']['Tables'];
    
    // Verify videos table
    type Video = Tables['videos']['Row'];
    const video: Video = {
      id: 'uuid-1',
      youtube_id: 'abc-123',
      title: 'Test Video',
      channel: 'Test Channel',
      duration: 120,
      thumbnail_url: 'http://example.com/thumb.jpg',
      created_at: '2026-05-18T00:00:00Z',
    };
    expect(video).toBeDefined();

    // Verify analyses table
    type Analysis = Tables['analyses']['Row'];
    const analysis: Analysis = {
      id: 'uuid-2',
      video_id: 'uuid-1',
      chapters: [],
      summary: 'Test summary',
      transcript: [],
      status: 'completed',
      created_at: '2026-05-18T00:00:00Z',
    };
    expect(analysis).toBeDefined();
  });
});
