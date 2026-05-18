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

describe('Home Page - Features', () => {
  it('renders three feature cards', () => {
    render(<Home />);
    
    // We should have a features section
    const featuresContainer = screen.getByTestId('features-section');
    expect(featuresContainer).toBeInTheDocument();
    
    // It should have 3 cards
    const cards = screen.getAllByTestId('feature-card');
    expect(cards).toHaveLength(3);
    
    // Feature 1
    expect(screen.getByText('AI Chapters')).toBeInTheDocument();
    
    // Feature 2
    expect(screen.getByText('Smart Summaries')).toBeInTheDocument();
    
    // Feature 3
    expect(screen.getByText('Full Transcripts')).toBeInTheDocument();
  });
});
