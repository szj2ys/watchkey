import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SearchPanel } from '../components/watch/SearchPanel';
import { RecommendationsPanel } from '../components/watch/RecommendationsPanel';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null })
}));

describe('Global A11y and UX', () => {
  it('SearchPanel has accessible inputs and minimum touch targets', async () => {
    const user = userEvent.setup();
    const { container } = render(<SearchPanel onAnalyze={jest.fn()} />);
    
    // We need to click the search button first because SearchPanel hides the input initially
    const searchTrigger = screen.getByRole('button', { name: /Toggle search/i });
    expect(searchTrigger).toBeInTheDocument();
    
    await user.click(searchTrigger!);
    
    // Now the input should be visible
    const input = screen.getByPlaceholderText(/Search YouTube videos.../i);
    expect(input.className).toMatch(/text-base/);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

  it('RecommendationsPanel thumbnails have alt text', async () => {
    const mockRecommendations = [
      {
        id: '1',
        title: 'Test Video',
        thumbnail: 'http://test.com/img.jpg',
        channel_title: 'Test Channel',
        published_at: '2023-01-01',
        view_count: '100',
        duration: '1:00'
      }
    ];
    
    const { container } = render(<RecommendationsPanel recommendations={mockRecommendations as any} currentVideoId="2" />);
    
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
