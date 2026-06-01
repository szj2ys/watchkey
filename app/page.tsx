import { createClient } from '@/lib/supabase/server';
import { parseDuration, formatViewCount, formatRelativeDate as formatDate, VideoItem } from '@/lib/youtube/utils';
import { Header } from '@/components/layout/Header';
import { HomeContent } from '@/components/home/HomeContent';

interface YouTubeVideoResponse {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails?: { high?: { url: string } };
  };
  contentDetails?: { duration: string };
  statistics?: { viewCount: string };
}

function mapVideoItem(item: YouTubeVideoResponse): VideoItem {
  return {
    id: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.high?.url || '',
    duration: parseDuration(item.contentDetails?.duration || ''),
    viewCount: formatViewCount(item.statistics?.viewCount),
    publishedAt: formatDate(item.snippet.publishedAt),
  };
}

interface SubscriptionItem {
  id: string;
  title: string;
  thumbnail: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
}

async function getYouTubeData(): Promise<{ subscriptions: SubscriptionItem[]; videos: VideoItem[] } | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.provider_token) return null;

  try {
    const subsRes = await fetch(
      'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=10&order=alphabetical',
      { headers: { Authorization: `Bearer ${session.provider_token}` } }
    );
    if (!subsRes.ok) return null;
    const subsData = await subsRes.json();
    const subscriptions: SubscriptionItem[] = (subsData.items || []).map((item: { snippet: { resourceId?: { channelId: string }; title: string; thumbnails?: { default?: { url: string } } }; id: string }) => ({
      id: item.snippet.resourceId?.channelId || item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.default?.url || '',
    }));

    const channelIds = subscriptions.slice(0, 5).map(s => s.id);
    let videos: VideoItem[] = [];
    if (channelIds.length > 0) {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelIds[0]}&maxResults=12&order=date&type=video`,
        { headers: { Authorization: `Bearer ${session.provider_token}` } }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const videoIds = (searchData.items || [])
          .map((i: YouTubeSearchItem) => i.id.videoId)
          .filter(Boolean);
        if (videoIds.length > 0) {
          const vidsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds.slice(0, 12).join(',')}`,
            { headers: { Authorization: `Bearer ${session.provider_token}` } }
          );
          if (vidsRes.ok) {
            const vidsData = await vidsRes.json();
            videos = (vidsData.items || []).map(mapVideoItem);
          }
        }
      }
    }

    return { subscriptions, videos };
  } catch {
    return null;
  }
}

async function getTrendingVideos(): Promise<VideoItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const { setupProxy } = await import('@/lib/proxy');
    await setupProxy();
  } catch {}

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=12&regionCode=US&key=${apiKey}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(mapVideoItem);
  } catch {
    return [];
  }
}

export default async function Home(): Promise<React.ReactElement> {
  const [data, trending] = await Promise.all([
    getYouTubeData(),
    getTrendingVideos(),
  ]);
  const loggedIn = !!data;

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <main className="flex-grow">
        <HomeContent loggedIn={loggedIn} data={data} trending={trending} />
      </main>

      <footer className="border-t border-[#272727] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24">
                <path d="M4 6L8 18L12 6L16 18L20 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
              <span className="text-sm font-bold text-white">WatchKey</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            </nav>
            <span className="text-xs text-gray-600">&copy; 2026 WatchKey</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
