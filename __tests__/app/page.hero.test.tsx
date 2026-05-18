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

describe('Home Page - Hero Section', () => {
  it('renders the hero section with main headline and subheadline', () => {
    render(<Home />);
    
    // Headline
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Understand any video in minutes');
    
    // Subheadline
    expect(screen.getByText('AI-generated chapters, summaries, and transcripts.')).toBeInTheDocument();
  });
});
