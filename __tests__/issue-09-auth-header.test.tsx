import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../components/layout/Header';
import { createClient } from '../lib/supabase/client';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

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
              email: 'test@example.com',
              user_metadata: { name: 'Test User', avatar_url: 'http://test.com/avatar.png' },
            },
          },
        },
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn(),
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
      signInWithOAuth: jest.fn(),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn(),
    },
  };
  (createClient as jest.Mock).mockReturnValue(mockSupabase);
  return mockSupabase;
}

describe('Issue #9 — Auth Header UI', () => {
  describe('Authenticated user dropdown', () => {
    it('shows Analysis History link in profile dropdown', async () => {
      mockAuthenticatedUser();
      const user = userEvent.setup();
      render(<Header />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user profile/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /user profile/i }));

      expect(screen.getByText(/analysis history/i)).toBeInTheDocument();
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });

    it('Analysis History link points to /history', async () => {
      mockAuthenticatedUser();
      const user = userEvent.setup();
      render(<Header />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user profile/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /user profile/i }));

      const historyLink = screen.getByText(/analysis history/i).closest('a');
      expect(historyLink).toHaveAttribute('href', '/history');
    });
  });

  describe('Anonymous user — email/password auth', () => {
    it('shows Sign In and Sign Up buttons when logged out', () => {
      mockAnonymousUser();
      render(<Header />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('shows email/password inputs when Sign In is clicked', async () => {
      mockAnonymousUser();
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit sign in/i })).toBeInTheDocument();
    });

    it('calls signInWithPassword on form submit', async () => {
      const mockSupabase = mockAnonymousUser();
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /submit sign in/i }));

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('still shows Google OAuth option alongside email/password', async () => {
      mockAnonymousUser();
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });
  });
});
