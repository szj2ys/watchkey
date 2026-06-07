import React from 'react';
import { render } from '@testing-library/react';
// Test that we've replaced text-gray-400/600 in certain components
import { VideoCard } from '../components/home/VideoCard';

describe('Global A11y Contrast', () => {
  it('VideoCard uses appropriate contrast classes', () => {
    const mockVideo = {
      id: '1',
      title: 'Test',
      channel_title: 'Channel',
      published_at: '2023',
      view_count: '100',
      duration: 'PT1M'
    };
    const { container } = render(<VideoCard video={mockVideo as any} />);
    
    // It should not use text-gray-400 anymore for text that needs contrast
    // We expect it to be updated to text-gray-400
    // We can just verify the snapshot or query for classes
    const html = container.innerHTML;
    expect(html).not.toMatch(/text-gray-600/);
    expect(html).toMatch(/text-gray-400/);
  });
});
