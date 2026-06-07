'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, RotateCcw, ArrowLeft, Search, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDuration } from '@/lib/youtube/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Player } from '@/components/watch/Player';
import { ChapterPanel } from '@/components/watch/ChapterPanel';
import { TranscriptPanel } from '@/components/watch/TranscriptPanel';
import { RecommendationsPanel } from '@/components/watch/RecommendationsPanel';
import { SearchPanel } from '@/components/watch/SearchPanel';
import { parseChapters, parseTranscript, findActiveChapter } from '@/components/watch/utils';
import type { AnalysisData, VideoData, SearchResult, YTPlayer, Chapter, TranscriptEntry } from '@/components/watch/types';

/* ─── Skeleton ─── */
function WatchSkeleton(): React.ReactElement {
  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen">
      <main className="max-w-[1800px] mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-4">
            <div className="aspect-video bg-[#1a1a1a] rounded-xl animate-pulse" />
            <div className="h-6 bg-[#1a1a1a] rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-[#1a1a1a] rounded w-1/2 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-[#1a1a1a] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Error State ─── */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }): React.ReactElement {
  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Unable to Load</h2>
          <p className="text-gray-400 mb-6 text-sm">
            {error.includes('500') ? 'Analysis service temporarily unavailable.' : error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onRetry}
              className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link href="/"
              className="px-6 py-3 bg-[#272727] text-white rounded-full font-medium hover:bg-[#3a3a3a] transition-colors text-sm text-center">
              Go Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Main Page ─── */
export default function WatchPage(): React.ReactElement {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSummary, setShowSummary] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);
  const [recommendations, setRecommendations] = useState<SearchResult[]>([]);
  const [player, setPlayer] = useState<YTPlayer | null>(null);

  const chapters: Chapter[] = analysis ? parseChapters(analysis.chapters) : [];
  const transcript: TranscriptEntry[] = analysis ? parseTranscript(analysis.transcript) : [];
  const activeChapterIdx: number = findActiveChapter(chapters, currentTime);
  const activeTranscriptIdx: number = transcript.findIndex((e, i) =>
    currentTime >= e.startTime && (i === transcript.length - 1 || currentTime < transcript[i + 1].startTime)
  );

  const fetchData = useCallback(async (): Promise<void> => {
    if (!params.id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/analyses/${params.id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error || `Server error (${res.status})`);
      }
      const data = await res.json() as AnalysisData & { videos: VideoData };
      setAnalysis(data);
      setVideo(data.videos);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (analysis?.status === 'processing' || analysis?.status === 'pending') {
      const id = setInterval(fetchData, 5000);
      return () => clearInterval(id);
    }
  }, [analysis?.status, fetchData]);

  useEffect(() => {
    if (!video?.youtube_id) return;
    fetch(`/api/youtube/related?videoId=${video.youtube_id}`)
      .then(res => res.ok ? res.json() : { items: [] })
      .then((data: { items: SearchResult[] }) => setRecommendations(data.items || []))
      .catch(() => {});
  }, [video?.youtube_id]);

  const seekTo = useCallback((seconds: number): void => {
    if (player) {
      player.seekTo(seconds, true);
      player.playVideo();
    }
  }, [player]);

  const handleAnalyze = useCallback(async (videoId: string): Promise<void> => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: `https://www.youtube.com/watch?v=${videoId}` }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json() as { analysis_id: string };
      router.push(`/watch/${data.analysis_id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to analyze video"); }
  }, [router]);

  if (loading) return <WatchSkeleton />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;
  if (!video || !analysis) return <ErrorState error="No data found" onRetry={fetchData} />;

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur border-b border-[#272727]">
        <div className="max-w-[1800px] mx-auto flex items-center gap-3 px-4 h-14">
          <Link href="/" aria-label="Go back" className="p-3 hover:bg-[#272727] rounded-full transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{video.title}</p>
            <p className="text-xs text-gray-400 truncate">{video.channel}</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 p-4 lg:p-6">
          {/* ── Left: Player + Info + Chapters + Summary + Transcript ── */}
          <div className="space-y-4 min-w-0">
            <ErrorBoundary fallbackTitle="Player Error" fallbackMessage="Unable to load the video player.">
              <Player videoId={video.youtube_id} onTimeUpdate={setCurrentTime} onPlayerReady={setPlayer} />
            </ErrorBoundary>

            {/* Title + meta */}
            <h1 className="text-xl lg:text-2xl font-bold leading-tight">{video.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-400">
              <span className="font-medium text-white">{video.channel}</span>
              <span className="hidden sm:block">&bull;</span>
              <span>{formatDuration(video.duration)}</span>
              <span className="hidden sm:block">&bull;</span>
              <span>{new Date(video.created_at).toLocaleDateString()}</span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                analysis.status === 'completed' ? 'bg-green-500/15 text-green-400' :
                analysis.status === 'processing' ? 'bg-yellow-500/15 text-yellow-400' :
                analysis.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                'bg-gray-500/15 text-gray-400'
              }`}>
                {analysis.status === 'processing' ? 'Analyzing...' :
                 analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
              </span>
              {(analysis.status === 'processing' || analysis.status === 'pending') && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  Up to 2 minutes
                </div>
              )}
              {analysis.error && <p className="text-xs text-red-400">{analysis.error}</p>}
            </div>

            <ErrorBoundary fallbackTitle="Chapter Error" fallbackMessage="Unable to load chapters.">
              <ChapterPanel chapters={chapters} activeChapterIdx={activeChapterIdx} onSeek={seekTo} />
            </ErrorBoundary>

            {/* AI Summary */}
            {analysis.summary && (
              <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
                <button onClick={() => setShowSummary(!showSummary)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#222] transition-colors">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <FileText className="w-4 h-4 text-blue-400" /> AI Summary
                  </div>
                  {showSummary ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showSummary && (
                  <div className="px-4 pb-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis.summary}</div>
                )}
              </div>
            )}

            <ErrorBoundary fallbackTitle="Transcript Error" fallbackMessage="Unable to load transcript.">
              <TranscriptPanel
                transcript={transcript}
                activeTranscriptIdx={activeTranscriptIdx}
                showTranscript={showTranscript}
                onToggle={() => setShowTranscript(!showTranscript)}
                onSeek={seekTo}
                videoId={video.youtube_id}
              />
            </ErrorBoundary>
          </div>

          {/* ── Right: Recommendations ── */}
          <aside className="space-y-4">
            <ErrorBoundary fallbackTitle="Recommendations Error" fallbackMessage="Unable to load recommendations.">
              <RecommendationsPanel recommendations={recommendations} onAnalyze={handleAnalyze} />
            </ErrorBoundary>
          </aside>
        </div>
      </main>
    </div>
  );
}
