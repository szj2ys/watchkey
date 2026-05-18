import { createClient as createBrowserClient } from '../../../lib/supabase/client';
import { createClient as createServerClient } from '../../../lib/supabase/server';
import { cookies } from 'next/headers';

// Mock Next.js headers/cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('Supabase Clients', () => {
  const mockUrl = 'http://localhost:54321';
  const mockKey = 'dummy-key';

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mockKey;
  });

  describe('createBrowserClient', () => {
    it('creates a client successfully', () => {
      const client = createBrowserClient();
      expect(client).toBeDefined();
    });
  });

  describe('createServerClient', () => {
    it('creates a client successfully', async () => {
      // Mock the cookies implementation
      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([]),
        setAll: jest.fn(),
      };
      (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

      const client = await createServerClient();
      expect(client).toBeDefined();
    });
  });
});
