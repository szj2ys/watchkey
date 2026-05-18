import { render, screen } from '@testing-library/react';
import WatchPage from '@/app/watch/page';

describe('Watch Page - Insights', () => {
  it('renders AI Summary and Transcript sections', () => {
    render(<WatchPage />);
    
    // Summary
    expect(screen.getByRole('heading', { name: /ai summary/i })).toBeInTheDocument();
    expect(screen.getByText('Overview of AI-powered analysis techniques.')).toBeInTheDocument();
    
    // Transcript
    expect(screen.getByRole('heading', { name: /transcript/i })).toBeInTheDocument();
    expect(screen.getByText('[00:15]')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back to WatchKey/i)).toBeInTheDocument();
  });
});
