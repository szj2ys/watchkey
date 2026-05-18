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

describe('Home Page - URL Input', () => {
  it('renders URL input with correct placeholder and validation', () => {
    render(<Home />);
    
    // Input element
    const input = screen.getByPlaceholderText('Paste YouTube URL here');
    expect(input).toBeInTheDocument();
    
    // Button element
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    expect(analyzeButton).toBeInTheDocument();
    
    // Hint text
    expect(screen.getByText('Analysis takes ~2 minutes')).toBeInTheDocument();
  });
});
