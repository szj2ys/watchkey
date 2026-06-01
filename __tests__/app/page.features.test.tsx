import { render, screen } from '@testing-library/react';
import { Features } from '@/components/Features';

describe('Features', () => {
  it('renders three feature cards', () => {
    render(<Features />);

    // We should have a features section
    const featuresContainer = screen.getByTestId('features-section');
    expect(featuresContainer).toBeInTheDocument();

    // It should have 3 cards
    const cards = screen.getAllByTestId('feature-card');
    expect(cards).toHaveLength(3);

    // Feature titles
    expect(screen.getByText('Smart Chapters')).toBeInTheDocument();
    expect(screen.getByText('AI Summaries')).toBeInTheDocument();
    expect(screen.getByText('Full Transcripts')).toBeInTheDocument();
  });
});
