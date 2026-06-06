import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroSection } from '@/components/home/HeroSection';
import { act } from '@testing-library/react';

const mockPush = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: jest.fn(),
    },
  }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HeroSection - Form Submission', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ analysis_id: 'test-id' }),
    });
  });

  it('validates YouTube URL format', async () => {
    render(<HeroSection loggedIn={false} />);

    const input = screen.getByPlaceholderText('Paste YouTube URL here');
    const button = screen.getByRole('button', { name: /analyze/i });

    // Invalid URL
    await act(async () => {
      fireEvent.change(input, { target: { value: 'not-a-url' } });
      fireEvent.click(button);
    });

    expect(await screen.findByText('Please enter a valid YouTube URL')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();

    // Valid URL
    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
      fireEvent.click(button);
    });

    expect(screen.queryByText('Please enter a valid YouTube URL')).not.toBeInTheDocument();
  });

  it('disables button when input is empty', async () => {
    render(<HeroSection loggedIn={false} />);

    const input = screen.getByPlaceholderText('Paste YouTube URL here');
    const button = screen.getByRole('button', { name: /analyze/i });

    // Initially disabled (empty input)
    expect(button).toBeDisabled();

    // Enabled after typing
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    expect(button).not.toBeDisabled();

    // Disabled again if cleared
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
    });
    expect(button).toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    // Use a slow promise to keep loading state visible
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<HeroSection loggedIn={false} />);

    const input = screen.getByPlaceholderText('Paste YouTube URL here');
    const button = screen.getByRole('button', { name: /analyze/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(button).toHaveTextContent(/analyzing/i);
    });
  });
});
