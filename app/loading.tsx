import { Header } from '@/components/layout/Header';
import { YouTubeFeedSkeleton } from '@/components/home/YouTubeFeed';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <main>
        <section className="flex flex-col items-center justify-center px-4 pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="text-center max-w-4xl w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-6">
              <div className="w-3.5 h-3.5 bg-blue-400/50 rounded-full animate-pulse" />
              Loading WatchKey...
            </div>
            
            {/* Title Skeleton */}
            <div className="h-16 md:h-24 bg-[#1a1a1a] rounded-2xl w-3/4 mx-auto mb-6 animate-pulse" />
            
            {/* Input Skeleton */}
            <div className="w-full max-w-2xl mx-auto h-14 bg-[#1a1a1a] rounded-full border border-[#272727] animate-pulse mb-16" />
          </div>
        </section>

        {/* Feed Skeleton */}
        <section className="max-w-6xl mx-auto px-4 py-8 lg:py-12 border-t border-[#272727]">
          <h2 className="text-lg font-bold mb-4">Trending</h2>
          <YouTubeFeedSkeleton />
        </section>
      </main>
    </div>
  );
}
