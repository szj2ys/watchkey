import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/page';

const mockPush = jest.fn();

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })
}));

describe('Home Page - Form Submission', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('validates YouTube URL format', async () => {
    render(<Home />);
    
    const input = screen.getByPlaceholderText('Paste YouTube URL here');
    const button = screen.getByRole('button', { name: /analyze/i });
    
    // Invalid URL
    fireEvent.change(input, { target: { value: 'not-a-url' } });
    fireEvent.click(button);
    
    expect(await screen.findByText('Please enter a valid YouTube URL')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    
    // Valid URL
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
    fireEvent.click(button);
    
    expect(screen.queryByText('Please enter a valid YouTube URL')).not.toBeInTheDocument();
  });
  
  it('disables button when input is empty', () => {
    render(<Home />);
    
    const input = screen.getByPlaceholderText('Paste YouTube URL here');
    const button = screen.getByRole('button', { name: /analyze/i });
    
    // Initially disabled
    expect(button).toBeDisabled();
    
    // Enabled after typing
    fireEvent.change(input, { target: { value: 'test' } });
    expect(button).not.toBeDisabled();
    
    // Disabled again if cleared
    fireEvent.change(input, { target: { value: '' } });
    expect(button).toBeDisabled();
  });
  
  it('shows loading state during submission', async () => {
    render(<Home />);
    
    const input = screen.getByPlaceholderText('Paste YouTube URL here');
    const button = screen.getByRole('button', { name: /analyze/i });
    
    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/analyzing/i);
  });
});
