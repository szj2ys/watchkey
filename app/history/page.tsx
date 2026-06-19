'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { Loader2, Clock, Play, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { formatDuration } from '@/lib/youtube/utils';

interface VideoData {
  id: string;
  youtube_id: string;
  title: string;
  channel: string;
  duration: number;
  thumbnail_url: string;
}

interface AnalysisData {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  videos: VideoData;
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuthenticated(false);
        router.push('/');
      } else {
        setAuthenticated(true);
        fetchHistory();
      }
    }).catch(() => {
      setAuthenticated(false);
      router.push('/');
    });
  }, [router]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analyses');
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AnalysisData['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  if (authenticated === false) {
    return null; // Let the redirect happen
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8 border-b border-[rgba(255,255,255,0.06)] pb-4">
          <Clock className="w-6 h-6 text-white/80" />
          <h1 className="text-2xl font-bold font-heading tracking-tight text-white">Analysis History</h1>
        </div>

        {loading ? (
          <div data-testid="history-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 space-y-3 animate-pulse">
                <div className="aspect-video bg-white/[0.04] rounded-md" />
                <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-white/[0.04] rounded w-20" />
                  <div className="h-4 bg-white/[0.04] rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl glass-card">
            <Clock className="w-12 h-12 text-white/20 mb-4" />
            <h2 className="text-lg font-bold mb-2">No analyses yet</h2>
            <p className="text-muted-foreground/60 text-sm max-w-md mb-6">
              Paste a YouTube video URL on the home page and start extracting insights, chapters, summaries, and interactive transcripts instantly.
            </p>
            <a 
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-[#e2e2e2] transition-colors"
            >
              Analyze your first video <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map(item => (
              <button
                key={item.id}
                onClick={() => router.push(`/watch/${item.id}`)}
                aria-label={item.videos?.title || 'Video Analysis'}
                className="group flex flex-col text-left bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-3 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] glass-card"
              >
                <div className="relative aspect-video rounded-md overflow-hidden bg-white/[0.03] mb-3 border border-[rgba(255,255,255,0.04)] w-full">
                  {item.videos?.thumbnail_url ? (
                    <img
                      src={item.videos.thumbnail_url}
                      alt={item.videos.title || 'Video Thumbnail'}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  {item.videos?.duration && (
                    <span className="absolute bottom-1.5 right-2 bg-black/80 text-white text-[10px] px-1 rounded">
                      {formatDuration(item.videos.duration)}
                    </span>
                  )}
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium line-clamp-2 text-white/90 group-hover:text-white transition-colors leading-snug">
                      {item.videos?.title || 'Unknown Title'}
                    </h3>
                    <p className="text-xs text-muted-foreground/60 mt-1">{item.videos?.channel || 'Unknown Channel'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-[rgba(255,255,255,0.04)] w-full">
                    {getStatusBadge(item.status)}
                    <span className="text-[10px] text-muted-foreground/40">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : ''}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[rgba(255,255,255,0.04)] py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24">
                <path d="M4 6L8 18L12 6L16 18L20 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
              <span className="text-sm font-bold text-white">WatchKey</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-[#555]">
              <a href="/privacy" className="hover:text-[#999] transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-[#999] transition-colors">Terms</a>
            </nav>
            <span className="text-xs text-[#444]">&copy; 2026 WatchKey</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
