import { render, screen } from '@testing-library/react';
import WatchPage from '@/app/watch/page';

describe('Watch Page', () => {
  it('renders correctly', () => {
    render(<WatchPage />);
    expect(screen.getByText('Understanding AI Video Analysis: A Deep Dive')).toBeInTheDocument();
  });
});
