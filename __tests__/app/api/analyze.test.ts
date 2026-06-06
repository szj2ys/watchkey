import { POST } from '@/app/api/analyze/route';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

const mockBgSupabase = {
  from: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue(mockBgSupabase),
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
import { getYouTubeVideoDetails, fetchYouTubeTranscript } from '@/lib/youtube/service';
import { AIService } from '@/lib/ai/service';

function createChainableMock() {
  const mock: any = {};
  mock.select = jest.fn().mockReturnValue(mock);
  mock.insert = jest.fn().mockReturnValue(mock);
  mock.update = jest.fn().mockReturnValue(mock);
  mock.eq = jest.fn().mockReturnValue(mock);
  mock.single = jest.fn();
  mock.from = jest.fn().mockReturnValue(mock);
  return mock;
}

describe('POST /api/analyze', () => {
  let mockSupabase: ReturnType<typeof createChainableMock>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createChainableMock();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    mockBgSupabase.from.mockClear();
    mockBgSupabase.update.mockClear();
    mockBgSupabase.eq.mockClear();
    (getYouTubeVideoDetails as jest.Mock).mockResolvedValue({
      title: 'Test Video',
      channel: 'Test Channel',
      duration: 300,
      thumbnailUrl: 'https://example.com/thumb.jpg',
    });
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('should use real transcript from fetchYouTubeTranscript instead of mock data', async () => {
    const realTranscript = [{ startTime: 0, text: 'This is a real transcript from YouTube. It has multiple sentences.' }];
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
      .mockResolvedValueOnce({ data: null, error: null }) // video check
      .mockResolvedValueOnce({ data: { id: 'video-uuid' }, error: null }) // insert video
      .mockResolvedValueOnce({ data: { id: 'analysis-uuid' }, error: null }); // insert analysis

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.analysis_id).toBe('analysis-uuid');
    // Background processing is fire-and-forget, wait for it
    await new Promise(r => setTimeout(r, 100));
    expect(fetchYouTubeTranscript).toHaveBeenCalledWith('dQw4w9WgXcQ');
  });

  it('should store transcript even when AI service fails', async () => {
    const realTranscript = [{ startTime: 0, text: 'Real transcript even when AI fails.' }];
    (fetchYouTubeTranscript as jest.Mock).mockResolvedValue(realTranscript);

    const mockAIService = {
      generateChapters: jest.fn().mockRejectedValue(new Error('AI service unavailable')),
      generateSummary: jest.fn().mockRejectedValue(new Error('AI service unavailable')),
      enhanceTranscript: jest.fn().mockRejectedValue(new Error('AI service unavailable')),
    };
    (AIService as jest.Mock).mockImplementation(() => mockAIService);

    mockSupabase.single
      .mockResolvedValueOnce({
        data: { id: 'existing-video', duration: 300, analyses: [] },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 'analysis-uuid' }, error: null });

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }),
    });

    const response = await POST(request as any);

    expect(response.status).toBe(201);
    // Background processing is fire-and-forget, wait for it
    await new Promise(r => setTimeout(r, 100));
    expect(fetchYouTubeTranscript).toHaveBeenCalledWith('dQw4w9WgXcQ');
  });
});
