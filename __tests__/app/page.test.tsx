import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

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
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
  }),
}));

describe('Header', () => {
  it('renders the header with WatchKey logo and search input', () => {
    render(<Header />);

    // Logo text
    expect(screen.getByText('WatchKey')).toBeInTheDocument();

    // Search input (desktop)
    const searchInputs = screen.getAllByPlaceholderText(/search/i);
    expect(searchInputs.length).toBeGreaterThanOrEqual(1);
  });
});
