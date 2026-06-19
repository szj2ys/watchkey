'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';

interface UsageData {
  loggedIn: boolean;
  count: number;
  limit: number;
}

export function HeroSection({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [showToast, setShowToast] = useState(false);

  const supabase = createClient();

  const validateUrl = (u: string) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(u);

  const fetchUsage = async () => {
    if (loggedIn) {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch (err) {
        console.error('Error fetching usage:', err);
      }
    } else {
      const guestCount = localStorage.getItem('watchkey_guest_count') || '0';
      setUsage({
        loggedIn: false,
        count: parseInt(guestCount, 10),
        limit: 1,
      });
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [loggedIn]);

  const submitAnalysis = async (youtubeUrl: string) => {
    setError('');
    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to analyze');
      }
      const data = await res.json();
      setSubmitSuccess(true);
      
      // Update guest usage if anonymous
      if (!loggedIn) {
        localStorage.setItem('watchkey_guest_count', '1');
        window.dispatchEvent(new Event('watchkey_guest_analysis_done'));
        fetchUsage();
        setShowToast(true);
      } else {
        fetchUsage();
      }

      setTimeout(() => router.push(`/watch/${data.analysis_id}`), 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(url)) { setError('Please enter a valid YouTube URL'); return; }
    await submitAnalysis(url);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (validateUrl(pasted)) { setUrl(pasted); submitAnalysis(pasted); }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/youtube.readonly',
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
    } catch {
      setAuthLoading(false);
    }
  };

  const limitReached = !!(usage && usage.count >= usage.limit);

  return (
    <section className="flex flex-col items-center justify-center px-4 pt-16 pb-12 lg:pt-24 lg:pb-16">
      <div className="text-center max-w-4xl w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-[#888] text-xs font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-powered analysis
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold font-heading tracking-[-0.04em] leading-[0.95] mb-6 text-white">
          Understand any video
          <br />
          <span className="text-[#888]">in minutes</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground font-normal mb-12 max-w-2xl mx-auto leading-relaxed">
          AI-generated chapters, summaries, and transcripts.
          <br className="hidden sm:block" />
          Paste a YouTube URL and get instant insights.
        </p>

        {/* URL Input - Luxe bottom-border style */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full max-w-2xl mx-auto gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Paste YouTube URL here"
              value={url}
              onChange={e => { setUrl(e.target.value); if (error) setError(''); if (submitSuccess) setSubmitSuccess(false); }}
              onPaste={handlePaste}
              disabled={isSubmitting || limitReached}
              className={`w-full h-14 px-6 text-base bg-transparent border border-[rgba(255,255,255,0.1)] rounded-full text-white placeholder-white/40 focus:outline-none focus:border-[rgba(255,255,255,0.25)] transition-all ${
                error ? 'border-red-500/60' : submitSuccess ? 'border-green-500/60' : ''
              } ${isSubmitting || limitReached ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            {isSubmitting && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <button type="submit" disabled={!url || isSubmitting || limitReached}
            className="h-14 px-8 bg-white text-black text-base font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-transparent hover:text-white hover:border hover:border-white flex items-center justify-center min-w-[140px] flex-shrink-0 uppercase tracking-tight">
            {isSubmitting ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing</span>
            ) : submitSuccess ? (
              <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Done</span>
            ) : 'Analyze'}
          </button>
        </form>

        {error && (
          <div className="flex items-center justify-center gap-2 mt-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        {submitSuccess && (
          <div className="flex items-center justify-center gap-2 mt-3 text-green-400 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" /> Analysis started
          </div>
        )}

        {/* Dynamic Usage Tracking / Limits display */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          {usage && (
            <p className="text-xs text-muted-foreground/60">
              {usage.loggedIn ? `${usage.count}/${usage.limit} analyses used today` : `${usage.count}/${usage.limit} free analyses used`}
            </p>
          )}
          {limitReached && (
            <div className="flex flex-col items-center gap-2 mt-1">
              <p className="text-sm text-red-400 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Daily limit reached
              </p>
              {loggedIn ? (
                <p className="text-xs text-muted-foreground/80">Please upgrade your plan to perform more analyses.</p>
              ) : (
                <p className="text-xs text-muted-foreground/80">Create a free account to reset your limits and analyze more videos.</p>
              )}
            </div>
          )}
        </div>

        {/* Google login CTA */}
        {!loggedIn && !limitReached && (
          <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.04)]">
            <p className="text-sm text-muted-foreground mb-4">Connect your YouTube account to see personalized recommendations</p>
            <button onClick={handleGoogleAuth} disabled={authLoading}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.06] border border-[rgba(255,255,255,0.08)] text-white rounded-full font-medium hover:bg-white/[0.1] transition-colors disabled:opacity-50 text-sm">
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* Floating Glassmorphic Toast for Guest Post-Analysis Sign-Up Prompt */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="glass-card rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] backdrop-blur-md p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white">Save your analysis — create a free account</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Create a free account to track your analysis history, unlock personalized recommendations, and reset your daily limits!
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                onClick={() => setShowToast(false)}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-white transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleGoogleAuth}
                className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-semibold hover:bg-white/90 transition-all uppercase tracking-tight"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
