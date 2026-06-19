import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import HistoryPage from '../app/history/page';
import { createClient } from '../lib/supabase/client';

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock Supabase client
jest.mock('../lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

function mockAuthenticatedUser() {
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
            },
          },
        },
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  };
  (createClient as jest.Mock).mockReturnValue(mockSupabase);
  return mockSupabase;
}

function mockAnonymousUser() {
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  };
  (createClient as jest.Mock).mockReturnValue(mockSupabase);
  return mockSupabase;
}

describe('Issue #11 — Analysis History Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it('redirects unauthenticated users to home', async () => {
    mockAnonymousUser();
    render(<HistoryPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading skeleton while fetching history', async () => {
    mockAuthenticatedUser();
    let resolveFetch: any;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    global.fetch = jest.fn().mockReturnValue(fetchPromise);

    render(<HistoryPage />);
    expect(screen.getByTestId('history-skeleton')).toBeInTheDocument();

    // Clean up pending promise
    resolveFetch({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it('renders history grid with video cards when analyses exist', async () => {
    mockAuthenticatedUser();
    
    const mockAnalyses = [
      {
        id: 'analysis-1',
        status: 'completed',
        created_at: '2026-06-19T00:00:00Z',
        videos: {
          id: 'video-1',
          youtube_id: 'dQw4w9WgXcQ',
          title: 'Never Gonna Give You Up',
          channel: 'Rick Astley',
          duration: 212,
          thumbnail_url: 'https://example.com/rick.jpg',
        },
      },
      {
        id: 'analysis-2',
        status: 'pending',
        created_at: '2026-06-18T12:00:00Z',
        videos: {
          id: 'video-2',
          youtube_id: 'lY20K8S_Cis',
          title: 'Another Test Video',
          channel: 'AI Channel',
          duration: 360,
          thumbnail_url: 'https://example.com/test.jpg',
        },
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAnalyses),
    });

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('history-skeleton')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument();
    expect(screen.getByText('Rick Astley')).toBeInTheDocument();
    expect(screen.getByText('Another Test Video')).toBeInTheDocument();
    expect(screen.getByText('AI Channel')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows empty state when no analyses are found', async () => {
    mockAuthenticatedUser();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('history-skeleton')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/no analyses yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /analyze your first video/i })).toHaveAttribute('href', '/');
  });

  it('clicking a history card navigates to /watch/[id]', async () => {
    mockAuthenticatedUser();
    const user = userEvent.setup();

    const mockAnalyses = [
      {
        id: 'analysis-123',
        status: 'completed',
        created_at: '2026-06-19T00:00:00Z',
        videos: {
          id: 'video-1',
          youtube_id: 'dQw4w9WgXcQ',
          title: 'Never Gonna Give You Up',
          channel: 'Rick Astley',
          duration: 212,
          thumbnail_url: 'https://example.com/rick.jpg',
        },
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAnalyses),
    });

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument();
    });

    const card = screen.getByRole('button', { name: /never gonna give you up/i });
    await user.click(card);

    expect(mockPush).toHaveBeenCalledWith('/watch/analysis-123');
  });
});
