import { render, screen } from '@testing-library/react';
import WatchPage from '@/app/watch/[id]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-video-id' }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/analyses/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test-analysis-id',
          status: 'completed',
          chapters: ['Introduction', 'Fundamentals'],
          summary: 'Test summary',
          transcript: 'Line 1\nLine 2',
          created_at: new Date().toISOString(),
          videos: {
            id: 'test-video-id',
            youtube_id: 'dQw4w9WgXcQ',
            title: 'Understanding AI Video Analysis: A Deep Dive',
            channel: 'WatchKey Official',
            duration: 1200,
          },
        }),
      });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
});

describe('Watch Page - Sidebar', () => {
  it('renders Chapters and Up Next sections', async () => {
    render(<WatchPage />);
    expect(await screen.findByText('Understanding AI Video Analysis: A Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('Chapters')).toBeInTheDocument();
    expect(screen.getByText('Up Next')).toBeInTheDocument();
  });
});
