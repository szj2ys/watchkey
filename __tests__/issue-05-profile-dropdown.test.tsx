import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Header } from '../components/layout/Header';
import { createClient } from '../lib/supabase/client';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

// Mock Supabase
jest.mock('../lib/supabase/client', () => ({
  createClient: jest.fn()
}));

const mockSupabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { 
        session: { 
          user: { 
            email: 'test@example.com', 
            user_metadata: { name: 'Test User', avatar_url: 'http://test.com/avatar.png' } 
          } 
        } 
      }
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    }),
    signOut: jest.fn().mockResolvedValue({ error: null })
  }
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('Header Profile Dropdown', () => {
  it('dropdown triggers on click, not hover, and closes on escape', async () => {
    const user = userEvent.setup();
    render(<Header />);
    
    // The button doesn't have an aria-label currently, so we need to find it another way,
    // but a good test checks for the *expected* accessible label
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /user profile/i })).toBeInTheDocument();
    });
    
    const profileTrigger = screen.getByRole('button', { name: /user profile/i });
    const signOutText = /Sign Out/i;
    
    // Not in document initially
    expect(screen.queryByText(signOutText)).not.toBeInTheDocument();
    
    // Click opens
    await user.click(profileTrigger);
    expect(screen.getByText(signOutText)).toBeVisible();
    
    // Escape closes
    await user.keyboard('{Escape}');
    expect(screen.queryByText(signOutText)).not.toBeInTheDocument();
  });
});

  it('dropdown is accessible', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /user profile/i })).toBeInTheDocument();
    });
    
    const profileTrigger = screen.getByRole('button', { name: /user profile/i });
    
    // It should have aria-expanded and aria-haspopup
    expect(profileTrigger).toHaveAttribute('aria-haspopup', 'true');
    expect(profileTrigger).toHaveAttribute('aria-expanded', 'false');
    
    await user.click(profileTrigger);
    expect(profileTrigger).toHaveAttribute('aria-expanded', 'true');
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
