/**
 * Issue #12 — Analysis Ownership: user_id stamping in /api/analyze
 *
 * Acceptance Criteria:
 * - /api/analyze calls supabase.auth.getUser() and extracts user.id when available
 * - Video insert includes user_id when authenticated, null when anonymous
 * - Analysis insert includes user_id when authenticated, null when anonymous
 * - Anonymous analysis still works end-to-end (no regression)
 */

import { POST } from '@/app/api/analyze/route';

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
import { getYouTubeVideoDetails } from '@/lib/youtube/service';

function createChainableMock(userId: string | null) {
  const insertCalls: Array<{ table: string; data: Record<string, unknown> }> = [];
  const mock: any = {};

  mock.select = jest.fn().mockReturnValue(mock);
  mock.insert = jest.fn((data: Record<string, unknown>) => {
    // Infer table from the data shape
    const table = 'video_id' in data ? 'analyses' : 'videos';
    insertCalls.push({ table, data });
    return mock;
  });
  mock.update = jest.fn().mockReturnValue(mock);
  mock.eq = jest.fn().mockReturnValue(mock);
  mock.single = jest.fn();
  mock.from = jest.fn().mockReturnValue(mock);

  mock.auth = {
    getUser: jest.fn(() => {
      if (userId) {
        return Promise.resolve({ data: { user: { id: userId } }, error: null });
      }
      return Promise.resolve({ data: { user: null }, error: null });
    }),
  };

  return { mock, insertCalls };
}

describe('Issue #12 — Analysis Ownership (user_id stamping)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('stamps user_id on video insert when authenticated', async () => {
    const { mock, insertCalls } = createChainableMock('user-abc-123');
    (createClient as jest.Mock).mockResolvedValue(mock);

    mock.single
      .mockResolvedValueOnce({ data: null, error: null }) // video check
      .mockResolvedValueOnce({ data: { id: 'video-uuid-1' }, error: null }) // insert video
      .mockResolvedValueOnce({ data: { id: 'analysis-uuid-1' }, error: null }); // insert analysis

    (getYouTubeVideoDetails as jest.Mock).mockResolvedValue({
      title: 'Test Video', channel: 'Test Channel', duration: 300, thumbnailUrl: 'https://example.com/thumb.jpg',
    });

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(mock.auth.getUser).toHaveBeenCalled();

    // Video insert should include user_id
    const videoInsert = insertCalls.find(c => c.table === 'videos');
    expect(videoInsert).toBeDefined();
    expect(videoInsert!.data.user_id).toBe('user-abc-123');
  });

  it('stamps user_id on analysis insert when authenticated', async () => {
    const { mock, insertCalls } = createChainableMock('user-abc-123');
    (createClient as jest.Mock).mockResolvedValue(mock);

    mock.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { id: 'video-uuid-1' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'analysis-uuid-1' }, error: null });

    (getYouTubeVideoDetails as jest.Mock).mockResolvedValue({
      title: 'Test Video', channel: 'Test Channel', duration: 300, thumbnailUrl: 'https://example.com/thumb.jpg',
    });

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(201);

    // Analysis insert should include user_id
    const analysisInsert = insertCalls.find(c => c.table === 'analyses');
    expect(analysisInsert).toBeDefined();
    expect(analysisInsert!.data.user_id).toBe('user-abc-123');
  });

  it('sets user_id to null when anonymous', async () => {
    const { mock, insertCalls } = createChainableMock(null);
    (createClient as jest.Mock).mockResolvedValue(mock);

    mock.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { id: 'video-uuid-1' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'analysis-uuid-1' }, error: null });

    (getYouTubeVideoDetails as jest.Mock).mockResolvedValue({
      title: 'Test Video', channel: 'Test Channel', duration: 300, thumbnailUrl: 'https://example.com/thumb.jpg',
    });

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(201);
    expect(mock.auth.getUser).toHaveBeenCalled();

    const videoInsert = insertCalls.find(c => c.table === 'videos');
    expect(videoInsert).toBeDefined();
    expect(videoInsert!.data.user_id).toBeNull();

    const analysisInsert = insertCalls.find(c => c.table === 'analyses');
    expect(analysisInsert).toBeDefined();
    expect(analysisInsert!.data.user_id).toBeNull();
  });

  it('returns 201 for authenticated user', async () => {
    const { mock } = createChainableMock('user-abc-123');
    (createClient as jest.Mock).mockResolvedValue(mock);

    mock.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { id: 'video-uuid-1' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'analysis-uuid-1' }, error: null });

    (getYouTubeVideoDetails as jest.Mock).mockResolvedValue({
      title: 'Test Video', channel: 'Test Channel', duration: 300, thumbnailUrl: 'https://example.com/thumb.jpg',
    });

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.analysis_id).toBe('analysis-uuid-1');
    expect(data.status).toBe('pending');
  });
});
