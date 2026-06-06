'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { Features } from '@/components/Features';
import { YouTubeFeed, YouTubeFeedSkeleton } from '@/components/home/YouTubeFeed';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { VideoItem } from '@/lib/youtube/utils';
import { VideoCard } from '@/components/home/VideoCard';

interface YouTubeData {
  subscriptions: { id: string; title: string; thumbnail: string }[];
  videos: VideoItem[];
}

function SearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Search failed')))
      .then(data => setResults(data.items || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-sm text-gray-400">Searching for "{query}"...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="space-y-2">
              <div className="aspect-video bg-[#1a1a1a] rounded-xl animate-pulse" />
              <div className="h-4 bg-[#1a1a1a] rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-[#1a1a1a] rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold">Results for "{query}"</h2>
        </div>
        <button onClick={onClear} className="text-sm text-gray-500 hover:text-white transition-colors px-3 py-1 rounded-full bg-[#272727] hover:bg-[#3a3a3a]">
          Clear
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      )}
    </section>
  );
}

function TrendingVideos({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <h2 className="text-lg font-bold mb-4">Trending</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </section>
  );
}

function InnerHomeContent({
  loggedIn,
  data,
  trending,
}: {
  loggedIn: boolean;
  data: YouTubeData | null;
  trending: VideoItem[];
}) {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(q);

  useEffect(() => setSearchQuery(q), [q]);

  if (searchQuery) {
    return <SearchResults query={searchQuery} onClear={() => setSearchQuery('')} />;
  }

  return (
    <>
      <HeroSection loggedIn={loggedIn} />
      {loggedIn && data ? (
        <YouTubeFeed data={data} />
      ) : (
        <>
          <TrendingVideos videos={trending} />
          <Features />
        </>
      )}
    </>
  );
}

export function HomeContent({
  loggedIn,
  data,
  trending,
}: {
  loggedIn: boolean;
  data: YouTubeData | null;
  trending: VideoItem[];
}) {
  return (
    <Suspense fallback={<YouTubeFeedSkeleton />}>
      <InnerHomeContent loggedIn={loggedIn} data={data} trending={trending} />
    </Suspense>
  );
}
