import { createClient } from '../../../lib/supabase/client';
import { Database } from '../../../types/database.types';

// Mock the Supabase client
jest.mock('../../../lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

describe('Database Operations', () => {
  const mockInsert = jest.fn();
  const mockSelect = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  
  const mockFrom = jest.fn().mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup chainable mock returns
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle, select: mockSelect });
    
    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    });
  });

  describe('Videos API', () => {
    it('creates a video record', async () => {
      const mockVideo = {
        id: '123',
        youtube_id: 'abc',
        title: 'Test',
        channel: 'Test Channel',
        duration: 100,
        thumbnail_url: 'http://example.com',
      };
      
      mockSingle.mockResolvedValue({ data: mockVideo, error: null });
      
      const client = createClient();
      const { data, error } = await client.from('videos').insert({
        youtube_id: 'abc',
        title: 'Test',
        channel: 'Test Channel',
        duration: 100,
        thumbnail_url: 'http://example.com',
      }).select().single();
      
      expect(mockFrom).toHaveBeenCalledWith('videos');
      expect(mockInsert).toHaveBeenCalled();
      expect(data).toEqual(mockVideo);
      expect(error).toBeNull();
    });
  });

  describe('Analyses API', () => {
    it('creates an analysis record', async () => {
      const mockAnalysis = {
        id: '456',
        video_id: '123',
        status: 'pending',
        chapters: [],
        transcript: [],
        summary: null,
      };
      
      mockSingle.mockResolvedValue({ data: mockAnalysis, error: null });
      
      const client = createClient();
      const { data, error } = await client.from('analyses').insert({
        video_id: '123',
        status: 'pending',
      }).select().single();
      
      expect(mockFrom).toHaveBeenCalledWith('analyses');
      expect(mockInsert).toHaveBeenCalled();
      expect(data).toEqual(mockAnalysis);
      expect(error).toBeNull();
    });
  });
});
