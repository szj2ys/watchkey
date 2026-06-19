import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { HomeContent } from '../components/home/HomeContent';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => 'test query' }), // Provide a query so SearchResults renders
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock Supabase
jest.mock('../lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    }
  })
}));

describe('HomeContent Search Results', () => {
  it('does not show empty state when there is an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Search failed'))
      })
    ) as jest.Mock;
    
    // Pass empty array instead of null
    render(<HomeContent initialTrending={[]} />);
    
    const errorMsg = await screen.findByText(/Search failed/i);
    expect(errorMsg).toBeInTheDocument();
    
    // We expect the "No results found" NOT to be in the DOM
    expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
  });
});
