'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Menu, Search, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && profileDropdownOpen) {
        setProfileDropdownOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileDropdownOpen]);

  // Trap focus roughly: when it opens, focus the first item (Sign Out)
  useEffect(() => {
    if (profileDropdownOpen) {
      const firstFocusable = dropdownRef.current?.querySelector('button') as HTMLButtonElement | null;
      firstFocusable?.focus();
    }
  }, [profileDropdownOpen]);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?q=${encodeURIComponent(searchQuery.trim())}`;
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfileDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSignIn = (): void => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/youtube.readonly',
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    });
  };

  return (
    <>
      <header className="flex items-center justify-between px-3 lg:px-4 py-2 bg-[#0f0f0f] sticky top-0 z-50 h-14 border-b border-[#272727]">
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <button aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-[#272727] rounded-full transition-colors">
            <Menu className="w-5 h-5 text-white" />
          </button>
          <Link href="/" className="flex items-center gap-1">
            <svg className="w-7 h-7 text-[#3b82f6]" fill="none" viewBox="0 0 24 24">
              <path d="M4 6L8 18L12 6L16 18L20 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">WatchKey</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2 lg:mx-8 hidden md:flex">
          <div className="flex w-full">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search YouTube videos"
              className="w-full h-10 px-4 py-2 bg-[#121212] border border-[#303030] rounded-l-full text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm" />
            <button type="submit" aria-label="Search"
              className="px-5 bg-[#222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#303030] transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
          {user ? (
            <div className="relative">
              <button 
                ref={triggerRef}
                aria-label="User Profile"
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-full overflow-hidden bg-[#272727] flex items-center justify-center flex-shrink-0"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {profileDropdownOpen && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#272727] rounded-xl shadow-xl transition-all z-50"
                >
                  <div className="p-3 border-b border-[#272727]">
                    <p className="text-sm font-medium text-white truncate">{user.user_metadata?.name || user.email}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#272727] transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#303030] text-blue-400 rounded-full text-sm hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign in</span>
            </button>
          )}
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f0f0f] border-r border-[#272727] flex flex-col">
            <form onSubmit={handleSearch} className="p-3 border-b border-[#272727]">
              <div className="flex items-center bg-[#121212] rounded-full border border-[#303030] px-3">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search" className="flex-1 h-9 bg-transparent text-white placeholder-gray-500 text-sm outline-none" />
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </form>
            <nav className="flex-1 py-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-[#272727]">
                <Menu className="w-5 h-5" /> Home
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
