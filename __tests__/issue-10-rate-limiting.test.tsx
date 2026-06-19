import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from '../components/home/HeroSection';
import { createClient } from '../lib/supabase/client';

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase
jest.mock('../lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

function mockAuthenticatedUser() {
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123', email: 'test@example.com' },
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

describe('Issue #10 — Rate Limiting & Post-Analysis Prompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    localStorage.clear();
  });

  describe('Authenticated user limits', () => {
    it('displays remaining count on home page ("X/3 analyses used today")', async () => {
      mockAuthenticatedUser();
      
      // Mock usage endpoint response: 1/3 used
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ loggedIn: true, count: 1, limit: 3 }),
      });

      await act(async () => {
        render(<HeroSection loggedIn={true} />);
      });

      await waitFor(() => {
        expect(screen.getByText(/1\/3 analyses used today/i)).toBeInTheDocument();
      });
    });

    it('disables Analyze button and shows limit message when limit reached', async () => {
      mockAuthenticatedUser();
      
      // Mock usage endpoint response: 3/3 used
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ loggedIn: true, count: 3, limit: 3 }),
      });

      await act(async () => {
        render(<HeroSection loggedIn={true} />);
      });

      await waitFor(() => {
        expect(screen.getByText(/3\/3 analyses used today/i)).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /analyze/i });
      expect(button).toBeDisabled();
      expect(screen.getByText(/Daily limit reached/i)).toBeInTheDocument();
    });
  });

  describe('Anonymous user limits & post-analysis toast', () => {
    it('shows guest usage "0/1 free analyses used" initially', async () => {
      mockAnonymousUser();

      await act(async () => {
        render(<HeroSection loggedIn={false} />);
      });

      expect(screen.getByText(/0\/1 free analyses used/i)).toBeInTheDocument();
    });

    it('shows non-intrusive toast encouraging sign-up after first analysis', async () => {
      mockAnonymousUser();
      const user = userEvent.setup();

      // Mock successful analyze request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ analysis_id: 'analysis-abc-123' }),
      });

      await act(async () => {
        render(<HeroSection loggedIn={false} />);
      });

      const input = screen.getByPlaceholderText(/paste youtube url/i);
      const button = screen.getByRole('button', { name: /analyze/i });

      await act(async () => {
        await user.type(input, 'https://youtube.com/watch?v=dQw4w9WgXcQ');
        await user.click(button);
      });

      // Verify localized guest limit is incremented in local storage
      expect(localStorage.getItem('watchkey_guest_count')).toBe('1');

      // Verify the toast is displayed
      await waitFor(() => {
        expect(screen.getByText(/Save your analysis — create a free account/i)).toBeInTheDocument();
      });
    });
  });
});
