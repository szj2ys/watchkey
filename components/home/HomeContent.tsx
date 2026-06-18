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

interface SearchResultsProps {
  query: string;
  onClear: () => void;
}

function SearchResults({ query, onClear }: SearchResultsProps) {
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!query) return;
    setLoading(true);
    setError(null);
    fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Search failed')))
      .then(data => { if(isMounted) setResults(data.items || []); })
      .catch(e => { if(isMounted) setError(e.message); })
      .finally(() => { if(isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [query]);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-[#555]" />
          <span className="text-sm text-[#555]">Searching for &quot;{query}&quot;...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="space-y-2">
              <div className="aspect-video bg-white/[0.04] rounded-lg animate-pulse" />
              <div className="h-4 bg-white/[0.04] rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-white/[0.04] rounded w-1/2 animate-pulse" />
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
          <SearchIcon className="w-5 h-5 text-[#555]" />
          <h2 className="text-lg font-bold font-heading text-white">Results for &quot;{query}&quot;</h2>
        </div>
        <button onClick={onClear} className="text-sm text-[#555] hover:text-white transition-colors px-3 py-1 rounded-full bg-white/[0.04] border border-[rgba(255,255,255,0.06)] hover:bg-white/[0.08]">
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
      ) : !error ? (
        <div className="text-center py-16">
          <p className="text-[#555]">No results found for &quot;{query}&quot;</p>
        </div>
      ) : null}
    </section>
  );
}

interface TrendingVideosProps {
  videos: VideoItem[];
}

function TrendingVideos({ videos }: TrendingVideosProps) {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <h2 className="text-lg font-bold mb-4 font-heading text-white">Trending</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </section>
  );
}

interface InnerHomeContentProps {
  loggedIn: boolean;
  data: YouTubeData | null;
  trending: VideoItem[];
}

function InnerHomeContent({
  loggedIn,
  data,
  trending,
}: InnerHomeContentProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentQuery = searchQuery || q;

  if (currentQuery) {
    return <SearchResults query={currentQuery} onClear={() => setSearchQuery('')} />;
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

interface HomeContentProps {
  loggedIn: boolean;
  data: YouTubeData | null;
  trending: VideoItem[];
}

export function HomeContent({
  loggedIn,
  data,
  trending,
}: HomeContentProps) {
  return (
    <Suspense fallback={<YouTubeFeedSkeleton />}>
      <InnerHomeContent loggedIn={loggedIn} data={data} trending={trending} />
    </Suspense>
  );
}
