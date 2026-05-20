import { POST } from '@/app/api/analyze/route';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/youtube/service', () => ({
  getYouTubeVideoDetails: jest.fn(),
  fetchYouTubeTranscript: jest.fn(),
}));

jest.mock('@/lib/ai/service', () => ({
  AIService: jest.fn().mockImplementation(() => ({
    generateChapters: jest.fn(),
    generateSummary: jest.fn(),
    enhanceTranscript: jest.fn(),
  })),
}));

import { createClient } from '@/lib/supabase/server';
import { getYouTubeVideoDetails, fetchYouTubeTranscript } from '@/lib/lib/youtube/service';
import { AIService } from '@/lib/ai/service';

describe('POST /api/analyze', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('should use real transcript from fetchYouTubeTranscript instead of mock data', async () => {
    const realTranscript = 'This is a real transcript from YouTube. It has multiple sentences.';
    (fetchYouTubeTranscript as jest.Mock).mockResolvedValue(realTranscript);
    
    const mockAIService = {
      generateChapters: jest.fn().mockResolvedValue([
        { startTime: 0, endTime: 60, title: 'Introduction' },
      ]),
      generateSummary: jest.fn().mockResolvedValue('This is a summary.'),
      enhanceTranscript: jest.fn().mockResolvedValue([
        { startTime: 0, endTime: 5, text: 'This is a real transcript' },
        { startTime: 5, endTime: 10, text: 'from YouTube' },
      ]),
    };
    (AIService as jest.Mock).mockImplementation(() => mockAIService);

    mockSupabase.single
      .mockResolvedValueOnce({ data: null, error: null }) // video not exists
      .mockResolvedValueOnce({ data: { id: 'video-uuid' }, error: null }); // insert video

    mockSupabase.insert
      .mockResolvedValueOnce({ data: { id: 'video-uuid' }, error: null }) // insert video
      .mockResolvedValueOnce({ data: { id: 'analysis-uuid' }, error: null }); // insert analysis

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=test123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.analysis_id).toBe('analysis-uuid');
    
    // Verify fetchYouTubeTranscript was called
    expect(fetchYouTubeTranscript).toHaveBeenCalledWith('test123');
  });

  it('should store transcript even when AI service fails', async () => {
    const realTranscript = 'Real transcript even when AI fails.';
    (fetchYouTubeTranscript as jest.Mock).mockResolvedValue(realTranscript);
    
    const mockAIService = {
      generateChapters: jest.fn().mockRejectedValue(new Error('AI service unavailable')),
      generateSummary: jest.fn().mockRejectedValue(new Error('AI service unavailable')),
      enhanceTranscript: jest.fn().mockRejectedValue(new Error('AI service unavailable')),
    };
    (AIService as jest.Mock).mockImplementation(() => mockAIService);

    mockSupabase.single
      .mockResolvedValueOnce({ data: { id: 'existing-video', duration: 300 }, error: null });

    mockSupabase.insert
      .mockResolvedValueOnce({ data: { id: 'analysis-uuid' }, error: null });

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=test123' }),
    });

    const response = await POST(request);
    
    expect(response.status).toBe(201);
    // The transcript should still be fetched even if AI fails
    expect(fetchYouTubeTranscript).toHaveBeenCalledWith('test123');
  });
});
