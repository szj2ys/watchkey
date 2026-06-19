'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Menu, Search, User as UserIcon, LogOut, LogIn, Clock } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

type AuthView = 'default' | 'signIn' | 'signUp';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('default');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
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
        setAuthView('default');
        setEmail('');
        setPassword('');
        setAuthError('');
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && profileDropdownOpen) {
        setProfileDropdownOpen(false);
        setAuthView('default');
        setEmail('');
        setPassword('');
        setAuthError('');
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

  const handleGoogleSignIn = (): void => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/youtube.readonly',
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    });
  };

  const handleEmailSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setAuthError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
    } else {
      setProfileDropdownOpen(false);
      setAuthView('default');
      setEmail('');
      setPassword('');
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setAuthError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
    } else {
      setProfileDropdownOpen(false);
      setAuthView('default');
      setEmail('');
      setPassword('');
    }
  };

  const resetAuthView = (): void => {
    setAuthView('default');
    setEmail('');
    setPassword('');
    setAuthError('');
  };

  return (
    <>
      <header className="flex items-center justify-between px-3 lg:px-4 py-2 bg-black sticky top-0 z-50 h-14 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <button aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-full transition-colors">
            <Menu className="w-5 h-5 text-white" />
          </button>
          <Link href="/" className="flex items-center gap-1">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24">
              <path d="M4 6L8 18L12 6L16 18L20 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block font-heading">WatchKey</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2 lg:mx-8 hidden md:flex">
          <div className="flex w-full">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search YouTube videos"
              className="w-full h-10 px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-l-full text-white placeholder-white/40 focus:border-[rgba(255,255,255,0.2)] focus:outline-none text-sm transition-colors" />
            <button type="submit" aria-label="Search"
              className="px-5 bg-[rgba(255,255,255,0.04)] border border-l-0 border-[rgba(255,255,255,0.08)] rounded-r-full hover:bg-[rgba(255,255,255,0.08)] transition-colors">
              <Search className="w-5 h-5 text-muted-foreground/60" />
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
                className="w-8 h-8 rounded-full overflow-hidden bg-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0 ring-1 ring-[rgba(255,255,255,0.1)]"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#888]" />
                )}
              </button>
              
              {profileDropdownOpen && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] rounded-xl glass-card transition-all z-50"
                >
                  <div className="p-3 border-b border-[rgba(255,255,255,0.06)]">
                    <p className="text-sm font-medium text-white truncate">{user.user_metadata?.name || user.email}</p>
                    <p className="text-xs text-muted-foreground/60 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/history"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-[#aaa] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                    >
                      <Clock className="w-4 h-4" /> Analysis History
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-[#aaa] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              {authView === 'default' ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setAuthView('signIn'); setProfileDropdownOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black rounded-full text-sm font-medium hover:bg-[#e2e2e2] transition-colors">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </button>
                  <button onClick={() => { setAuthView('signUp'); setProfileDropdownOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[rgba(255,255,255,0.06)] text-white rounded-full text-sm font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors ring-1 ring-[rgba(255,255,255,0.1)]">
                    <span className="hidden sm:inline">Sign Up</span>
                  </button>
                </div>
              ) : (
                <button
                  ref={triggerRef}
                  aria-label="Auth Menu"
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden bg-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0 ring-1 ring-[rgba(255,255,255,0.1)]"
                >
                  <UserIcon className="w-4 h-4 text-[#888]" />
                </button>
              )}

              {profileDropdownOpen && authView !== 'default' && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-72 bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] rounded-xl glass-card transition-all z-50"
                >
                  <div className="p-3 border-b border-[rgba(255,255,255,0.06)]">
                    <p className="text-sm font-medium text-white">
                      {authView === 'signIn' ? 'Sign In' : 'Sign Up'}
                    </p>
                  </div>
                  <form onSubmit={authView === 'signIn' ? handleEmailSignIn : handleEmailSignUp} className="p-3 space-y-3">
                    {authError && (
                      <p className="text-xs text-red-400">{authError}</p>
                    )}
                    <div>
                      <label htmlFor="auth-email" className="sr-only">Email</label>
                      <input
                        id="auth-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        aria-label="Email"
                        required
                        className="w-full h-9 px-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white placeholder-white/40 text-sm focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="auth-password" className="sr-only">Password</label>
                      <input
                        id="auth-password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        aria-label="Password"
                        required
                        className="w-full h-9 px-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white placeholder-white/40 text-sm focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      aria-label={authView === 'signIn' ? 'Submit Sign In' : 'Submit Sign Up'}
                      className="w-full h-9 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e2e2e2] transition-colors"
                    >
                      {authView === 'signIn' ? 'Sign In' : 'Sign Up'}
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[rgba(255,255,255,0.06)]" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-[#0a0a0a] px-2 text-xs text-[#666]">or</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Google"
                      onClick={handleGoogleSignIn}
                      className="w-full h-9 flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>
                    <div className="flex items-center justify-between pt-1">
                      <button type="button" onClick={resetAuthView}
                        className="text-xs text-[#666] hover:text-white transition-colors">
                        Back
                      </button>
                      {authView === 'signIn' ? (
                        <button type="button" onClick={() => { setAuthView('signUp'); setAuthError(''); }}
                          className="text-xs text-[#666] hover:text-white transition-colors">
                          Need an account? Sign Up
                        </button>
                      ) : (
                        <button type="button" onClick={() => { setAuthView('signIn'); setAuthError(''); }}
                          className="text-xs text-[#666] hover:text-white transition-colors">
                          Have an account? Sign In
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-black border-r border-[rgba(255,255,255,0.06)] flex flex-col">
            <form onSubmit={handleSearch} className="p-3 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center bg-[rgba(255,255,255,0.04)] rounded-full border border-[rgba(255,255,255,0.08)] px-3">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search" className="flex-1 h-9 bg-transparent text-white placeholder-white/40 text-sm outline-none" />
                <Search className="w-4 h-4 text-muted-foreground/60" />
              </div>
            </form>
            <nav className="flex-1 py-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-[rgba(255,255,255,0.06)]">
                <Menu className="w-5 h-5" /> Home
              </Link>
              {user && (
                <Link href="/history" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 text-sm text-white hover:bg-[rgba(255,255,255,0.06)]">
                  <Clock className="w-5 h-5" /> History
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
