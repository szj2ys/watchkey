import { render, screen } from '@testing-library/react';
import WatchPage from '@/app/watch/page';

describe('Watch Page - Sidebar', () => {
  it('renders Chapters and Up Next sections', () => {
    render(<WatchPage />);
    
    // Chapters
    expect(screen.getByRole('heading', { name: /chapters/i })).toBeInTheDocument();
    expect(screen.getByText('[00:00] Introduction')).toBeInTheDocument();
    expect(screen.getByText('[01:15] Fundamentals of Analysis')).toBeInTheDocument();
    
    // Up Next
    expect(screen.getByRole('heading', { name: /up next/i })).toBeInTheDocument();
    expect(screen.getByText('Next Video: Implementing AI Tools')).toBeInTheDocument();
  });
});
