import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })
}));

describe('Home Page', () => {
  it('renders the header with WatchKey logo and search input', () => {
    render(<Home />);
    
    // Using test ID to verify the main navigation header exists
    const header = screen.getByTestId('main-navigation');
    expect(header).toBeInTheDocument();
    
    // Logo text
    expect(screen.getByText('WatchKey')).toBeInTheDocument();
    
    // Search input
    const searchInput = screen.getByPlaceholderText('Search');
    expect(searchInput).toBeInTheDocument();
  });
});
