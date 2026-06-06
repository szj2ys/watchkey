'use client';

import { VideoItem } from '@/lib/youtube/utils';
import { VideoCard } from '@/components/home/VideoCard';

interface Props {
  data: {
    subscriptions: { id: string; title: string; thumbnail: string }[];
    videos: VideoItem[];
  };
}

export function YouTubeFeed({ data }: Props) {
  const { subscriptions, videos } = data;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      {subscriptions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4">Subscriptions</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {subscriptions.map(sub => (
              <div key={sub.id} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#272727] overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors">
                  {sub.thumbnail ? (
                    <img src={sub.thumbnail} alt={sub.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">?</div>
                  )}
                </div>
                <span className="text-xs text-gray-400 text-center w-16 truncate">{sub.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Recommended</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        </div>
      )}

      {videos.length === 0 && subscriptions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No YouTube data available. Try signing in again.</p>
        </div>
      )}
    </section>
  );
}

export function YouTubeFeedSkeleton() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-6 w-32 bg-[#1a1a1a] rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
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
