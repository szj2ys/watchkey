'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { useParams, useRouter } from "next/navigation";

interface TranscriptEntry {
  text: string;
  startTime: number;
  confidence?: number;
}

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [activeTranscriptIndex, setActiveTranscriptIndex] = useState(-1);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    if (!params.id) return;

    try {
      setLoading(true);
      setError(null);

      const analysisResponse = await fetch(`/api/analyses/${params.id}`);
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server error (${analysisResponse.status})`
        );
      }
      const analysisJson = await analysisResponse.json();

      setAnalysisData(analysisJson);
      setVideoData(analysisJson.videos);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Load YouTube IFrame API and create player
  useEffect(() => {
    if (!videoData?.youtube_id) return;

    const createPlayer = () => {
      if (!playerContainerRef.current) return;
      playerContainerRef.current.innerHTML = '';

      const div = document.createElement('div');
      div.id = 'yt-player';
      playerContainerRef.current.appendChild(div);

      playerRef.current = new (window as any).YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: videoData.youtube_id,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            // Start polling current time
            intervalRef.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime();
                updateActiveTranscript(currentTime);
              }
            }, 250);
          },
        },
      });
    };

    // Load IFrame API if not already loaded
    if (!(window as any).YT?.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoData?.youtube_id]);

  const updateActiveTranscript = useCallback((currentTime: number) => {
    if (!analysisData?.transcript || !Array.isArray(analysisData.transcript)) return;

    let newIndex = -1;
    for (let i = analysisData.transcript.length - 1; i >= 0; i--) {
      if (currentTime >= analysisData.transcript[i].startTime) {
        newIndex = i;
        break;
      }
    }

    setActiveTranscriptIndex((prev) => {
      if (prev !== newIndex) {
        // Auto-scroll transcript to active entry
        const container = transcriptContainerRef.current;
        if (container && newIndex >= 0) {
          const entry = container.children[newIndex] as HTMLElement;
          if (entry) {
            entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
      return newIndex;
    });
  }, [analysisData?.transcript]);

  const seekToTime = useCallback((timeInSeconds: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(timeInSeconds, true);
      playerRef.current.playVideo();
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const exportTranscript = useCallback(() => {
    if (!analysisData?.transcript || !Array.isArray(analysisData.transcript)) return;

    const text = analysisData.transcript
      .map((entry: TranscriptEntry) => `[${formatTime(entry.startTime)}] ${entry.text}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${videoData?.youtube_id || 'video'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analysisData?.transcript, videoData?.youtube_id]);

  const handleRetry = () => {
    setRetrying(true);
    fetchData();
  };

  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string): { className: string; label: string } => {
    switch (status) {
      case 'completed':
        return { className: 'bg-green-100 text-green-800', label: 'Completed' };
      case 'pending':
        return { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'processing':
        return { className: 'bg-yellow-100 text-yellow-800', label: 'Processing' };
      case 'failed':
        return { className: 'bg-red-100 text-red-800', label: 'Failed' };
      default:
        return {
          className: 'bg-gray-100 text-gray-800',
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const parseTranscriptEntries = (transcript: any): TranscriptEntry[] => {
    if (!transcript) return [];
    if (Array.isArray(transcript)) return transcript;
    if (typeof transcript === 'string') {
      return transcript.split('\n').map((line, i) => ({
        text: line,
        startTime: i * 30,
      }));
    }
    return [];
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-500 mx-auto"></div>
            <div>
              <p className="text-lg font-medium text-slate-900">Loading analysis...</p>
              <p className="text-sm text-slate-500 mt-1">This may take a moment</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Unable to Load Analysis
            </h2>
            <p className="text-slate-600 mb-6">
              {error.includes('500')
                ? "Our analysis service is temporarily unavailable. Please try again in a few moments."
                : error
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {retrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Retrying...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </>
                )}
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-slate-200 text-slate-800 rounded-full font-medium hover:bg-slate-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No data state
  if (!videoData || !analysisData) {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Analysis Found</h2>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  const transcriptEntries = parseTranscriptEntries(analysisData.transcript);

  // Main content
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />

      <main className="max-w-[1400px] mx-auto p-4 lg:p-6 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Video and Info */}
          <div className="lg:col-span-8 space-y-6">

            {/* Video Player */}
            <section className="rounded-2xl overflow-hidden shadow-xl aspect-video" ref={playerContainerRef}>
              <div className="w-full h-full bg-black flex items-center justify-center text-white">
                <p className="text-sm opacity-70">Loading player...</p>
              </div>
            </section>

            {/* Video Metadata */}
            <section>
              <h1 className="text-2xl font-bold mb-1">{videoData.title || 'Unknown Title'}</h1>
              <p className="text-sm text-slate-500 mb-6">
                {videoData.channel || 'Unknown Channel'} •
                {formatDuration(videoData.duration || 0)} •
                {new Date(videoData.created_at).toLocaleDateString()}
              </p>
            </section>

            {/* Analysis Status */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-medium">Analysis Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(analysisData.status).className}`}
                >
                  {getStatusBadge(analysisData.status).label}
                </span>
              </div>
              {analysisData.error && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600">{analysisData.error}</p>
                </div>
              )}
            </div>

            {/* AI Summary */}
            {analysisData.summary && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold mb-3">AI Summary</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{analysisData.summary}</p>
              </div>
            )}

          </div>

          {/* Right Column: Transcript Sidebar */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Transcript Section */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Transcript</h2>
                {transcriptEntries.length > 0 && (
                  <button
                    onClick={exportTranscript}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-medium transition-colors"
                  >
                    Export .txt
                  </button>
                )}
              </div>
              <div ref={transcriptContainerRef} className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                {transcriptEntries.length > 0 ? (
                  transcriptEntries.map((entry: TranscriptEntry, index: number) => (
                    <div
                      key={index}
                      onClick={() => seekToTime(entry.startTime)}
                      className={`flex gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                        index === activeTranscriptIndex
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-xs font-mono flex-shrink-0 pt-0.5 ${
                        index === activeTranscriptIndex ? 'text-blue-100' : 'text-slate-400'
                      }`}>
                        {formatTime(entry.startTime)}
                      </span>
                      <p className={`text-sm leading-relaxed ${
                        index === activeTranscriptIndex ? 'text-white' : 'text-slate-700'
                      }`}>
                        {entry.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-400 italic">No transcript available</p>
                  </div>
                )}
              </div>
            </section>

            {/* Chapters */}
            {Array.isArray(analysisData.chapters) && analysisData.chapters.length > 0 && (
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold mb-4">Chapters</h2>
                <div className="space-y-2">
                  {analysisData.chapters.map((chapter: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all rounded-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                      <span className="text-sm font-medium text-slate-700">{chapter}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </aside>
        </div>
      </main>
    </div>
  );
}
