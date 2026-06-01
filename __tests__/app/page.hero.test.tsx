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

describe('HeroSection', () => {
  it('renders the hero section with main headline and subheadline', () => {
    render(<HeroSection loggedIn={false} />);

    // Headline
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Understand any video/);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/in minutes/);

    // Subheadline
    expect(screen.getByText(/AI-generated chapters, summaries, and transcripts/)).toBeInTheDocument();
  });
});
