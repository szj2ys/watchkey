import { Header } from '@/components/layout/Header';
import { YouTubeFeedSkeleton } from '@/components/home/YouTubeFeed';

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <section className="flex flex-col items-center justify-center px-4 pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="text-center max-w-4xl w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-[#555] text-xs font-medium mb-8">
              <div className="w-3.5 h-3.5 bg-white/20 rounded-full animate-pulse" />
              Loading WatchKey...
            </div>
            
            {/* Title Skeleton */}
            <div className="h-16 md:h-24 bg-white/[0.04] rounded-xl w-3/4 mx-auto mb-6 animate-pulse" />
            
            {/* Input Skeleton */}
            <div className="w-full max-w-2xl mx-auto h-14 bg-white/[0.04] rounded-full border border-[rgba(255,255,255,0.04)] animate-pulse mb-16" />
          </div>
        </section>

        {/* Feed Skeleton */}
        <section className="max-w-6xl mx-auto px-4 py-8 lg:py-12 border-t border-[rgba(255,255,255,0.04)]">
          <h2 className="text-lg font-bold mb-4 font-heading text-white">Trending</h2>
          <YouTubeFeedSkeleton />
        </section>
      </main>
    </div>
  );
}
