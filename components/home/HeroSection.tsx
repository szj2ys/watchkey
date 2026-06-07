'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Check, AlertCircle, LogIn, Sparkles } from 'lucide-react';

export function HeroSection({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const supabase = createClient();

  const validateUrl = (u: string) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(u);

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

  return (
    <section className="flex flex-col items-center justify-center px-4 pt-16 pb-12 lg:pt-24 lg:pb-16">
      <div className="text-center max-w-4xl w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-powered YouTube analysis
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Understand any video
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            in minutes
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 font-normal mb-10 max-w-2xl mx-auto">
          AI-generated chapters, summaries, and transcripts.
          <br className="hidden sm:block" />
          Paste a YouTube URL and get instant insights.
        </p>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full max-w-2xl mx-auto gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Paste YouTube URL here"
              value={url}
              onChange={e => { setUrl(e.target.value); if (error) setError(''); if (submitSuccess) setSubmitSuccess(false); }}
              onPaste={handlePaste}
              disabled={isSubmitting}
              className={`w-full h-14 px-6 text-base bg-[#121212] border rounded-full text-white placeholder-gray-500 focus:outline-none transition-all ${
                error ? 'border-red-500' : submitSuccess ? 'border-green-500' : 'border-[#303030] focus:border-blue-500'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            {isSubmitting && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          <button type="submit" disabled={!url || isSubmitting}
            className="h-14 px-8 bg-blue-500 hover:bg-blue-600 text-white text-base font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[140px] flex-shrink-0">
            {isSubmitting ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</span>
            ) : submitSuccess ? (
              <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Done!</span>
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
            <Check className="w-4 h-4 flex-shrink-0" /> Analysis started! Redirecting…
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">Analysis takes ~2 minutes · No sign-up required</p>

        {/* Google login CTA (only when not logged in) */}
        {!loggedIn && (
          <div className="mt-10 pt-8 border-t border-[#272727]">
            <p className="text-sm text-gray-400 mb-4">Connect your YouTube account to see personalized recommendations</p>
            <button onClick={handleGoogleAuth} disabled={authLoading}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm">
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
    </section>
  );
}
