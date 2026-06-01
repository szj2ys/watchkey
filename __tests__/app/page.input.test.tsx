import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/home/HeroSection';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
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

describe('HeroSection - URL Input', () => {
  it('renders URL input with correct placeholder and validation', () => {
    render(<HeroSection loggedIn={false} />);

    // Input element
    const input = screen.getByPlaceholderText('Paste YouTube URL here');
    expect(input).toBeInTheDocument();

    // Button element
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    expect(analyzeButton).toBeInTheDocument();

    // Hint text
    expect(screen.getByText(/Analysis takes ~2 minutes/)).toBeInTheDocument();
  });
});
