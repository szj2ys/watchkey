import { render, screen } from '@testing-library/react';
import WatchPage from '@/app/watch/page';

describe('Watch Page - Video Player', () => {
  it('renders the video player section', () => {
    render(<WatchPage />);
    expect(screen.getByText('YouTube Player')).toBeInTheDocument();
  });
});
