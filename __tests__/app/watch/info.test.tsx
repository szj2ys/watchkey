import { render, screen } from '@testing-library/react';
import WatchPage from '@/app/watch/page';

describe('Watch Page - Video Info', () => {
  it('renders video title and metadata', () => {
    render(<WatchPage />);
    expect(screen.getByText('Understanding AI Video Analysis: A Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('1.2M views • 2 days ago')).toBeInTheDocument();
    
    // Use getAllByText for elements that appear multiple times
    const channelNames = screen.getAllByText('WatchKey Official');
    expect(channelNames.length).toBeGreaterThan(0);
    
    expect(screen.getByText('245K subscribers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });
});
